// Reference photo uploads: warn before submit if the selected photos add up to more than ~25 MB
// (Forminit's limit: 25 MB per submission, all files combined). Nothing typed into the form is lost; the visitor can pick smaller photos
// or send the request without them and email the photos afterward.
(function () {
  // Forminit has one redirect per form in its dashboard, but the waitlist and booking forms share one
  // Forminit form. So submit with fetch and go to this form's own thank-you page (data-thanks).
  // If fetch fails (old browser, network), fall back to a normal post; Forminit then uses its dashboard redirect.
  function send(form) {
    var btn = form.querySelector('[type="submit"]');
    if (btn) btn.disabled = true;
    if (!window.fetch || !window.FormData) { form.submit(); return; }
    fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        if (res.ok) { window.location.href = form.getAttribute("data-thanks") || res.d.redirectUrl || "thanks.html"; return; }
        if (btn) btn.disabled = false;
        window.alert("Sorry, that didn't go through" + (res.d && res.d.message ? ": " + res.d.message : "") +
          ". Please try again in a few seconds, or email aspraguetattoo@gmail.com.");
      })
      .catch(function () { form.submit(); });
  }
  var groups = document.querySelectorAll(".file-group");
  Array.prototype.forEach.call(groups, function (group) {
    var form = group.closest("form");
    var inputs = group.querySelectorAll('input[type="file"]');
    var warn = group.querySelector(".file-warn");
    var clear = group.querySelector(".file-clear");
    var maxBytes = (parseFloat(group.getAttribute("data-max-mb")) || 25) * 1024 * 1024;
    if (!form || !inputs.length) return;

    function totalBytes() {
      var sum = 0;
      Array.prototype.forEach.call(inputs, function (input) {
        Array.prototype.forEach.call(input.files || [], function (f) { sum += f.size; });
      });
      return sum;
    }
    function mb(bytes) { return (bytes / (1024 * 1024)).toFixed(1); }

    function update() {
      var total = totalBytes();
      if (clear) clear.hidden = total === 0;
      if (!warn) return;
      if (total > maxBytes) {
        warn.textContent = "These photos add up to " + mb(total) + " MB, over the ~25 MB limit. Pick smaller ones, or send the form without them and email the photos to aspraguetattoo@gmail.com after you submit.";
        warn.hidden = false;
      } else {
        warn.textContent = "";
        warn.hidden = true;
      }
    }

    Array.prototype.forEach.call(inputs, function (input) {
      input.addEventListener("change", update);
    });

    if (clear) {
      clear.addEventListener("click", function () {
        Array.prototype.forEach.call(inputs, function (input) { input.value = ""; });
        update();
      });
    }

    // Runs only after the browser's own required-field checks pass.
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var total = totalBytes();
      if (total <= maxBytes) { send(form); return; }
      update();
      var sendWithout = window.confirm(
        "Your reference photos add up to " + mb(total) + " MB, which is over the ~25 MB upload limit.\n\n" +
        "OK: send the form now without the photos (you can email them to aspraguetattoo@gmail.com afterward).\n" +
        "Cancel: go back and pick smaller photos. Everything you typed stays put."
      );
      if (sendWithout) {
        Array.prototype.forEach.call(inputs, function (input) { input.value = ""; });
        update();
        send(form);
      } else if (warn) {
        warn.scrollIntoView({ block: "center" });
      }
    });
  });
})();
