// Reference photo uploads: warn before submit if the selected photos add up to more than ~10 MB
// (FormSubmit's limit). Nothing typed into the form is lost; the visitor can pick smaller photos
// or send the request without them and email the photos afterward.
(function () {
  var groups = document.querySelectorAll(".file-group");
  Array.prototype.forEach.call(groups, function (group) {
    var form = group.closest("form");
    var inputs = group.querySelectorAll('input[type="file"]');
    var warn = group.querySelector(".file-warn");
    var clear = group.querySelector(".file-clear");
    var maxBytes = (parseFloat(group.getAttribute("data-max-mb")) || 10) * 1024 * 1024;
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
        warn.textContent = "These photos add up to " + mb(total) + " MB, over the ~10 MB limit. Pick smaller ones, or send the form without them and email the photos to aspraguetattoo@gmail.com after you submit.";
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
      var total = totalBytes();
      if (total <= maxBytes) return;
      e.preventDefault();
      update();
      var sendWithout = window.confirm(
        "Your reference photos add up to " + mb(total) + " MB, which is over the ~10 MB upload limit.\n\n" +
        "OK: send the form now without the photos (you can email them to aspraguetattoo@gmail.com afterward).\n" +
        "Cancel: go back and pick smaller photos. Everything you typed stays put."
      );
      if (sendWithout) {
        Array.prototype.forEach.call(inputs, function (input) { input.value = ""; });
        update();
        form.submit();
      } else if (warn) {
        warn.scrollIntoView({ block: "center" });
      }
    });
  });
})();
