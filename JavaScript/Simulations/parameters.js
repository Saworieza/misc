/*
 * Parameters of the experiment bound to DOM elements.
 */
(function(host) {

  function Parameters() {
    this.values = null;
    this.onParametersChange = null;
  }

  Parameters.prototype.getParameterNames = function() {
    var parameterNames = [];

    for (var parameterName in this.values) {
      parameterNames.push(parameterName);
    }
    return parameterNames;
  };

  Parameters.prototype.bindParameter = function(parameterName) {
    var self = this;
    var inputElement = document.querySelector("#" + parameterName);

    inputElement.value = this.values[parameterName];
    inputElement.addEventListener("blur", function(event) {
      self.values[parameterName] = this.value;
      self.onParametersChange && self.onParametersChange();
    });
    inputElement.addEventListener("keyup", function(event) {
      //Enter
      if (event.keyCode == 13) {
        this.blur();
      }
    });
  };

  Parameters.prototype.bind = function(parameters, onParametersChange) {
    var self = this;

    this.values = parameters;
    this.getParameterNames().forEach(function(parameterName) {
      self.bindParameter(parameterName);
    });
    this.onParametersChange = onParametersChange;
  };

  Parameters.prototype.evaluate = function(parameterName) {
    var value = this.values[parameterName];

    value = value.replace(/(\d)pi/g, function(match, nextDigit) {
      return nextDigit + " * pi";
    }).replace(/pi/g, "Math.PI");
    return eval(value);
  }

  host.Parameters = Parameters;
})(this);