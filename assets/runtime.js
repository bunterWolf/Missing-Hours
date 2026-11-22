/*
 * Minimal runtime for the landing page exported from Claude Design (.dc.html).
 *
 * _design/build.mjs turns the design's template holes into data attributes:
 *   data-dc='[["class","{{ a.b }}"], …]'  attributes filled from renderVals()
 *   data-dc-text="a.b"                    text content
 *   data-dc-if="a.b"                      shown when truthy (hidden otherwise)
 *   data-dc-on='{"click":"a.b"}'          event handlers from renderVals()
 * The design's own logic (class Component extends DCLogic) lives in assets/design.js, unchanged.
 * This file is written by hand and doesn't change when the design does.
 */
(function () {
  'use strict';

  function get(obj, path) {
    return path.split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, obj);
  }

  function fill(tpl, vals) {
    return tpl.replace(/\{\{\s*([\w.$]+)\s*\}\}/g, function (_, p) {
      var v = get(vals, p);
      return v == null ? '' : String(v);
    });
  }

  var bindings = [];
  var component = null;

  function render() {
    var vals = component.renderVals();
    component._vals = vals;
    bindings.forEach(function (b) {
      if (b.attrs) {
        b.attrs.forEach(function (pair) {
          var value = fill(pair[1], vals);
          if (b.el.getAttribute(pair[0]) !== value) b.el.setAttribute(pair[0], value);
        });
      }
      if (b.text) {
        var text = get(vals, b.text);
        text = text == null ? '' : String(text);
        if (b.el.textContent !== text) b.el.textContent = text;
      }
      if (b.cond) {
        var hide = !get(vals, b.cond);
        if (b.el.hidden !== hide) b.el.hidden = hide;
      }
    });
  }

  function DCLogic() {
    this.props = {};
    this.state = {};
    this._queued = false;
  }
  DCLogic.prototype.setState = function (patch) {
    this.state = Object.assign({}, this.state, patch);
    if (this._queued) return;
    this._queued = true;
    var self = this;
    Promise.resolve().then(function () {
      self._queued = false;
      render();
    });
  };

  function boot() {
    if (typeof window.MHDesign !== 'function') return;
    var Component = window.MHDesign(DCLogic);
    component = new Component();

    document.querySelectorAll('[data-dc], [data-dc-text], [data-dc-if]').forEach(function (el) {
      bindings.push({
        el: el,
        attrs: el.hasAttribute('data-dc') ? JSON.parse(el.getAttribute('data-dc')) : null,
        text: el.getAttribute('data-dc-text'),
        cond: el.getAttribute('data-dc-if')
      });
    });
    document.querySelectorAll('[data-dc-on]').forEach(function (el) {
      var handlers = JSON.parse(el.getAttribute('data-dc-on'));
      Object.keys(handlers).forEach(function (type) {
        el.addEventListener(type, function (e) {
          var fn = get(component._vals || component.renderVals(), handlers[type]);
          if (typeof fn === 'function') fn(e);
        });
      });
    });

    render();
    if (typeof component.componentDidMount === 'function') component.componentDidMount();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
