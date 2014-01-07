'use strict';

describe('modal', function () {

  var $compile, $templateCache, scope, sandboxEl;

  beforeEach(module('ngSanitize'));
  beforeEach(module('mgcrea.ngStrap.modal'));

  beforeEach(inject(function (_$rootScope_, _$compile_, _$templateCache_) {
    scope = _$rootScope_.$new();
    sandboxEl = $('<div>').attr('id', 'sandbox').appendTo($('body'));
    $compile = _$compile_;
    $templateCache = _$templateCache_;
  }));

  afterEach(function() {
    scope.$destroy();
    sandboxEl.remove();
  });

  // Templates

  var templates = {
    'default': {
      scope: {modal: {title: 'Title', content: 'Hello Modal<br>This is a multiline message!'}},
      element: '<a title="{{modal.title}}" data-content="{{modal.content}}" bs-modal>click me</a>'
    },
    'markup-scope': {
      element: '<a bs-modal="modal">click me</a>'
    },
    'markup-ngRepeat': {
      scope: {items: [{name: 'foo', modal: {title: 'Title', content: 'Hello Modal<br>This is a multiline message!'}}]},
      element: '<ul><li ng-repeat="item in items"><a title="{{item.modal.title}}" data-content="{{item.modal.content}}" bs-modal>{{item.name}}</a></li></ul>'
    },
    'options-placement': {
      element: '<a data-placement="bottom" bs-modal="modal">click me</a>'
    },
    'options-placement-exotic': {
      element: '<a data-placement="center" bs-modal="modal">click me</a>'
    },
    'options-template': {
      scope: {modal: {title: 'Title', content: 'Hello Modal<br>This is a multiline message!', counter: 0}, items: ['foo', 'bar', 'baz']},
      element: '<a title="{{modal.title}}" data-content="{{modal.content}}" data-template="custom" bs-modal>click me</a>'
    }
  };

  function compileDirective(template, locals) {
    template = templates[template];
    angular.extend(scope, template.scope || templates['default'].scope, locals);
    var element = $(template.element).appendTo(sandboxEl);
    element = $compile(element)(scope);
    scope.$digest();
    return jQuery(element[0]);
  }

  // Tests

  describe('with default template', function () {

    it('should open on click', function() {
      var elm = compileDirective('default');
      expect(sandboxEl.children('.modal').length).toBe(0);
      angular.element(elm[0]).triggerHandler('click');
      expect(sandboxEl.children('.modal').length).toBe(1);
    });

    it('should close on click', function() {
      var elm = compileDirective('default');
      expect(sandboxEl.children('.modal').length).toBe(0);
      angular.element(elm[0]).triggerHandler('click');
      angular.element(elm[0]).triggerHandler('click');
      expect(sandboxEl.children('.modal').length).toBe(0);
    });

    it('should correctly compile inner content', function() {
      var elm = compileDirective('default');
      angular.element(elm[0]).triggerHandler('click');
      expect(sandboxEl.find('.modal-title').html()).toBe(scope.modal.title);
      expect(sandboxEl.find('.modal-body').html()).toBe(scope.modal.content);
    });

    it('should support scope as object', function() {
      var elm = compileDirective('markup-scope');
      angular.element(elm[0]).triggerHandler('click');
      expect(sandboxEl.find('.modal-title').html()).toBe(scope.modal.title);
      expect(sandboxEl.find('.modal-body').html()).toBe(scope.modal.content);
    });

    it('should support ngRepeat markup inside', function() {
      var elm = compileDirective('markup-ngRepeat');
      angular.element(elm.find('[bs-modal]')).triggerHandler('click');
      expect(sandboxEl.find('.modal-title').html()).toBe(scope.items[0].modal.title);
      expect(sandboxEl.find('.modal-body').html()).toBe(scope.items[0].modal.content);
    });

  });


  describe('options', function () {

    describe('animation', function () {

      it('should default to `animation-fade` animation', function() {
        var elm = compileDirective('default');
        angular.element(elm[0]).triggerHandler('click');
        expect(sandboxEl.children('.modal').hasClass('animation-fade')).toBeTruthy();
      });

    });

    describe('placement', function () {

      it('should default to `top` placement', function() {
        var elm = compileDirective('default');
        angular.element(elm[0]).triggerHandler('click');
        expect(sandboxEl.children('.modal').hasClass('top')).toBeTruthy();
      });

      it('should support placement', function() {
        var elm = compileDirective('options-placement');
        angular.element(elm[0]).triggerHandler('click');
        expect(sandboxEl.children('.modal').hasClass('bottom')).toBeTruthy();
      });

      it('should support exotic-placement', function() {
        var elm = compileDirective('options-placement-exotic');
        angular.element(elm[0]).triggerHandler('click');
        expect(sandboxEl.children('.modal').hasClass('center')).toBeTruthy();
      });

    });

    describe('template', function () {

      it('should support custom template', function() {
        $templateCache.put('custom', '<div class="modal"><div class="modal-inner">foo: {{title}}</div></div>');
        var elm = compileDirective('options-template');
        angular.element(elm[0]).triggerHandler('click');
        expect(sandboxEl.find('.modal-inner').text()).toBe('foo: ' + scope.modal.title);
      });

      it('should support template with ngRepeat', function() {
        $templateCache.put('custom', '<div class="modal"><div class="modal-inner"><ul><li ng-repeat="item in items">{{item}}</li></ul></div></div>');
        var elm = compileDirective('options-template');
        angular.element(elm[0]).triggerHandler('click');
        expect(sandboxEl.find('.modal-inner').text()).toBe('foobarbaz');
        // Consecutive toggles
        angular.element(elm[0]).triggerHandler('click');
        angular.element(elm[0]).triggerHandler('click');
        expect(sandboxEl.find('.modal-inner').text()).toBe('foobarbaz');
      });

      it('should support template with ngClick', function() {
        $templateCache.put('custom', '<div class="modal"><div class="modal-inner"><a class="btn" ng-click="modal.counter=modal.counter+1">click me</a></div></div>');
        var elm = compileDirective('options-template');
        angular.element(elm[0]).triggerHandler('click');
        expect(angular.element(sandboxEl.find('.modal-inner > .btn')[0]).triggerHandler('click'));
        expect(scope.modal.counter).toBe(1);
        // Consecutive toggles
        angular.element(elm[0]).triggerHandler('click');
        angular.element(elm[0]).triggerHandler('click');
        expect(angular.element(sandboxEl.find('.modal-inner > .btn')[0]).triggerHandler('click'));
        expect(scope.modal.counter).toBe(2);
      });

    });

  });

});
