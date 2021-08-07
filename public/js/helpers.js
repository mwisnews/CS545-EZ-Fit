module.exports = {
  greaterThanOne: function (value, options) {
    if (value > 1) {
      return options.fn(this);
    }
    return options.inverse(this);
  },
};
