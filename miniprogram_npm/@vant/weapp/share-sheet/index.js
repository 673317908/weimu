'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var component_1 = require('../common/component');
component_1.VantComponent({
  props: {
    // whether to show popup
    show: Boolean,
    // overlay custom style
    overlayStyle: Object,
    // z-index
    zIndex: [Number, String],
    title: String,
    cancelText: {
      type: String,
      value: 'بولدى قىلىش',
    },
    description: String,
    options: {
      type: Array,
      value: [],
    },
    overlay: {
      type: Boolean,
      value: true,
    },
    safeAreaInsetBottom: {
      type: Boolean,
      value: true,
    },
    closeOnClickOverlay: {
      type: Boolean,
      value: true,
    },
    duration: {
      type: null,
      value: 300,
    },
  },
  methods: {
    onClickOverlay: function () {
      this.$emit('click-overlay');
    },
    onCancel: function () {
      this.onClose();
      this.$emit('cancel');
    },
    onSelect: function (event) {
      this.$emit('select', event.detail);
    },
    onClose: function () {
      this.$emit('close');
    },
  },
});
