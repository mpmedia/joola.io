var baseUrl = require.toUrl('./');

var frameworkBin = [
  baseUrl + 'angular/app.js',
  baseUrl + 'angular/services.js',
  baseUrl + 'angular/controllers.js',
  baseUrl + 'angular/directives.js',
  baseUrl + 'angular/filters.js'
];

var manageBin = [
  baseUrl + 'dashboard.js',
  baseUrl + 'nodes.js',
  baseUrl + 'logger.js'
];

//The magic starts only after the document is loaded and joola.io framework is loaded.
$(document).ready(function () {
  define(["require"], function (require) {
    require(frameworkBin, function () {
      angular.bootstrap(document, ['ngjoola']);
      require(manageBin, function () {
        $(window).trigger('page-ready');
      });
    });
  });
});

$.fn.serializeObject = function () {
  var o = {};
  var a = this.serializeArray();
  $.each(a, function () {
    if (o[this.name] !== undefined) {
      if (!o[this.name].push) {
        o[this.name] = [o[this.name]];
      }
      o[this.name].push(this.value || '');
    } else {
      o[this.name] = this.value || '';
    }
  });
  return o;
};

$('#addUserBtn').on('click', function () {
  clearDialog('addUserDialog');
  $('#addUserDialog').modal();
})

$('#addRoleBtn').on('click', function () {
  clearDialog('addRoleDialog');
  $('#addRoleDialog').modal();
})

$('#addOrgBtn').on('click', function () {
  clearDialog('addOrgDialog');
  $('#addOrgDialog').modal();
})


$.fn.arrayToList = function () {
  var html = '';
  $(this).each(function (i, val) {
    html += "<div class='checkbox'>" +
      "<label>" +
      "<input type='checkbox' value='" + val + "'>" +
      val +
      "</label>" +
      "</div>"
  })
  return html;
}


function clearDialog(container) {
  $('#' + container + ' input:text').val("");
  $('#' + container + ' input:checkbox').prop('checked', false);
  $('#' + container + ' .spinner').css('display', 'none');
  $('#' + container + ':disabled').attr('disabled', '');
}

function clearNgDialog(container) {
  $('#' + container + ' .spinner').css('display', 'none');
  $('#' + container + ' .btn').prop('disabled', false);
}

var sessionExpiredTimer = 0;

var waitForIdle = function () {
  location.href = '/logout';
};

$(document).on('click', function () {
  clearTimeout(sessionExpiredTimer);
  sessionExpiredTimer = setTimeout(waitForIdle, 20 * 60 * 1000 /* 20 minutes */);
});

sessionExpiredTimer = setTimeout(waitForIdle, 20 * 60 * 1000 /* 20 minutes */);