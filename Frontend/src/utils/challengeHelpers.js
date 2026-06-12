export const challengeToSteps = (challenge) => {
  if (!challenge) return [];
  const tasks = challenge.changesToBeDone || [];
  const rules = challenge.rules || [];
  
  return tasks.map((taskText, idx) => {
    const rule = rules.find(r => r.stepIndex === idx) || { type: "CONSOLE_NO_ERRORS" };
    return {
      task: taskText,
      type: rule.type || "TAG_EXISTS",
      selector: rule.selector || "",
      targetId: rule.targetSelector || "",
      value: rule.value || "",
      errorMessage: rule.errorMessage || ""
    };
  });
};

export const stepsToRulesAndTasks = (steps) => {
  const changesToBeDone = [];
  const rules = [];
  
  steps.forEach((step, idx) => {
    changesToBeDone.push(step.task || `Complete task ${idx + 1}`);
    const selector = step.selector || "";
    const targetSelector = step.targetId || "";
    let errorMessage = step.errorMessage;
    if (!errorMessage) {
      const msgMap = {
        TAG_EXISTS: `Missing element matching '${selector}'`,
        TEXT_EQUALS: `Expected text of '${selector}' to be exactly '${step.value}'`,
        TEXT_CONTAINS: `Expected text of '${selector}' to contain '${step.value}'`,
        CLICK_AND_ASSERT: `Clicking '${selector}' did not update '${targetSelector}' to '${step.value}'`,
        INPUT_AND_ASSERT: `Entering value into '${selector}' did not reflect '${step.value}' in '${targetSelector}'`,
        CONSOLE_LOG_CONTAINS: `Console output must contain: '${step.value}'`
      };
      errorMessage = msgMap[step.type] || `Task criteria not met for: "${step.task}"`;
    }
    rules.push({ type: step.type, selector, targetSelector, value: step.value, errorMessage, stepIndex: idx });
  });
  return { changesToBeDone, rules };
};

export const generateStarterCode = (steps, title) => {
  const startHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>${title || 'HTML 5 Boilerplate'}</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <script src="index.js"></script>
  </body>
</html>`;

  const startCss = `/* Write your styles here */`;
  const startJs = `// Write your JavaScript code here\nconsole.log("App ready!");`;

  return {
    html: startHtml,
    css: startCss,
    js: startJs,
    solHtml: startHtml,
    solCss: startCss,
    solJs: startJs
  };
};
