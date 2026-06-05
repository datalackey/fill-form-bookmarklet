(function() {
  var allElements = Array.prototype.slice.call(
    document.querySelectorAll('input, select, textarea')
  );
  var fields = allElements.filter(function(el) {
    if (!el.name) return false;
    if (el.tagName === 'INPUT') {
      var t = (el.type || 'text').toLowerCase();
      if (t === 'submit' || t === 'button') return false;
      return true;
    }
    return true;
  });

  function detectLabel(el) {
    if (el.id) {
      var forLabel = document.querySelector('label[for="' + el.id + '"]');
      if (forLabel) {
        return { text: forLabel.textContent.trim().split('\n')[0].trim(), pattern: 1 };
      }
    }
    var parent = el.parentElement;
    while (parent) {
      if (parent.tagName === 'LABEL') {
        return { text: parent.textContent.trim().split('\n')[0].trim(), pattern: 2 };
      }
      parent = parent.parentElement;
    }
    var sibling = el.previousElementSibling;
    while (sibling) {
      if (sibling.tagName === 'LABEL') {
        return { text: sibling.textContent.trim(), pattern: 3 };
      }
      sibling = sibling.previousElementSibling;
    }
    var container = el.parentElement;
    if (container) {
      var containerSibling = container.previousElementSibling;
      while (containerSibling) {
        if (containerSibling.tagName === 'LABEL') {
          return { text: containerSibling.textContent.trim(), pattern: '3b' };
        }
        containerSibling = containerSibling.previousElementSibling;
      }
    }
    return { text: '', pattern: 0 };
  }

  var report = fields.map(function(el) {
    var labelResult = detectLabel(el);
    return {
      name: el.name,
      label: labelResult.text,
      pattern: labelResult.pattern
    };
  });

  console.table(report);
})();

