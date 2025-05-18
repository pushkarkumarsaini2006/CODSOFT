/**
 * Created by chuandong on 15/11/27.
 * Enhanced with keyboard input, backspace, safe evaluation, and improved UX.
 * Fixed decimal logic, error handling, and added accessibility.
 */

function load() {
  const btns = document.querySelectorAll("#calculator span");
  const operators = ["+", "-", "x", "÷"];
  const inputScreen = document.querySelector("#screen");
  let decimalAdded = false; // Tracks decimal in current number

  // Update screen and manage error state
  function updateScreen(value, isError = false) {
    inputScreen.textContent = value;
    inputScreen.setAttribute("aria-live", "polite");
    inputScreen.style.borderColor = isError ? "red" : "#000";
  }

  // Check if input ends with an operator
  function endsWithOperator(input) {
    return operators.includes(input[input.length - 1]);
  }

  // Handle number input
  function handleNumber(btnValue, input) {
    // Clear error state if present
    if (input === "Error") {
      updateScreen(btnValue);
      decimalAdded = false;
      return;
    }
    // Reset decimalAdded if starting a new number
    if (input && endsWithOperator(input)) {
      decimalAdded = false;
    }
    updateScreen(input + btnValue);
  }

  // Handle operator input
  function handleOperator(btnValue, input) {
    if (input === "Error") {
      updateScreen(btnValue === "-" ? btnValue : "");
      decimalAdded = false;
      return;
    }
    if (!input && btnValue === "-") {
      updateScreen(btnValue);
    } else if (input && !endsWithOperator(input)) {
      updateScreen(input + btnValue);
      decimalAdded = false;
    } else if (endsWithOperator(input) && input.length > 1) {
      updateScreen(input.slice(0, -1) + btnValue);
    }
  }

  // Handle decimal input
  function handleDecimal(input) {
    if (input === "Error") {
      updateScreen("");
      decimalAdded = false;
      return;
    }
    if (!decimalAdded && input && !endsWithOperator(input)) {
      updateScreen(input + ".");
      decimalAdded = true;
    }
  }

  // Handle evaluation
  function handleEquals(input) {
    if (!input || input === "Error") return;
    let expression = input.replace(/x/g, "*").replace(/÷/g, "/");
    if (endsWithOperator(expression) || expression.endsWith(".")) {
      expression = expression.slice(0, -1);
    }
    try {
      // Use Function constructor for safe evaluation if math.js is not available
      let result;
      try {
        // eslint-disable-next-line no-new-func
        result = Function('"use strict";return (' + expression + ")")();
      } catch {
        result = NaN;
      }
      updateScreen(isFinite(result) ? result : "Error", !isFinite(result));
      decimalAdded = false;
    } catch {
      updateScreen("Error", true);
      decimalAdded = false;
    }
  }

  // Handle backspace
  function handleBackspace(input) {
    if (!input || input === "Error") return;
    const newInput = input.slice(0, -1);
    updateScreen(newInput);
    // Update decimalAdded based on new input
    decimalAdded = newInput.includes(".") && !endsWithOperator(newInput);
  }

  // Main input handler
  function handleInput(btnValue) {
    let input = inputScreen.textContent;

    switch (btnValue) {
      case "C":
        updateScreen("");
        decimalAdded = false;
        break;
      case "=":
        handleEquals(input);
        break;
      case ".":
        handleDecimal(input);
        break;
      case "+":
      case "-":
      case "x":
      case "÷":
        handleOperator(btnValue, input);
        break;
      case "Backspace":
        handleBackspace(input);
        break;
      default:
        if (/[0-9]/.test(btnValue)) {
          handleNumber(btnValue, input);
        }
        break;
    }
  }

  // Button click event listeners
  btns.forEach((btn) => {
    btn.setAttribute("role", "button");
    btn.setAttribute("aria-label", btn.textContent);
    btn.addEventListener("click", () => {
      handleInput(btn.textContent);
    });
  });

  // Keyboard input event listener
  document.addEventListener("keydown", (event) => {
    const key = event.key;

    // Prevent default only when calculator is focused
    if (["+", "-", "*", "/", "=", "Enter", ".", "Escape", "c", "C", "Backspace"].includes(key) || /[0-9]/.test(key)) {
      if (document.activeElement.closest("#calculator") || !document.activeElement.tagName.toLowerCase() === "input") {
        event.preventDefault();
      }
    }

    // Map keyboard keys to calculator actions
    if (/[0-9]/.test(key)) {
      handleInput(key);
    } else if (key === "+" || key === "-" || key === "*" || key === "/") {
      const keyToOperator = { "+": "+", "-": "-", "*": "x", "/": "÷" };
      handleInput(keyToOperator[key]);
    } else if (key === ".") {
      handleInput(".");
    } else if (key === "=" || key === "Enter") {
      handleInput("=");
    } else if (key === "Escape" || key === "c" || key === "C") {
      handleInput("C");
    } else if (key === "Backspace") {
      handleInput("Backspace");
    }
  });

  // Prevent context menu on right-click for the calculator
  const calculator = document.querySelector("#calculator");
  calculator.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });
}