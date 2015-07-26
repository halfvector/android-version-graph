(function() {
  'use strict';

  angular
    .module('versionsStreamgraph')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log) {

    $log.debug('runBlock end');
  }

})();
