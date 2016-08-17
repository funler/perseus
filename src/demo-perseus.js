/**
 * Loads the Perseus demo pages
 *
 * This file initializes the Khan globals and mounts Demo pages
 * to demonstrate and develop the Perseus application
 */
require('./perseus-env.js');

window.Khan = {
    Util: KhanUtil,
    error: function() {},
    query: {debug: ""},
    imageBase: "/images/",
};

const Perseus = window.Perseus = require('./editor-perseus.js');
const ReactDOM = window.ReactDOM = React.__internalReactDOM;

const EditorDemo = require('./editor-demo.jsx');
const RendererDemo = require('./renderer-demo.jsx');
const ArticleDemo = require('./article-demo.jsx');

Perseus.init({skipMathJax: false, loadExtraWidgets: true}).then(function() {
    $(Exercises).bind("gotoNextProblem", function() {
      ReactDOM.unmountComponentAtNode(document.getElementById("perseus-container"));
      hideExerciseLoadingBar();
      var question = JSON.parse(window.khanExerciseLoader.currentExercise.data.json);
      var problemNum = Math.floor(Math.random() * 100);
      var questinInfo = [RendererDemo, {question, problemNum}];
      DemoComponent = null;
      DemoComponent = ReactDOM.render(
          React.createElement(...(questinInfo)),
          document.getElementById("perseus-container")
      );
      DemoComponent.clearScratchpad();
      Calculator.init();
    });

    $(Exercises).bind("useHintFromFunler", function() {
      DemoComponent.takeHint();
    });
}).then(function() {

}, function(err) {
    console.error(err); // @Nolint
});
