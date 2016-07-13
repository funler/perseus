/**
 * Loads the Perseus demo pages
 *
 * This file initializes the Khan globals and mounts Demo pages
 * to demonstrate and develop the Perseus application
 */

require("./perseus-env.js");

window.Khan = {
    Util: KhanUtil,
    error: function() {},
    query: {debug: ""},
    imageBase: "/images/",
};

const Perseus = (window.Perseus = require("./editor-perseus.js"));
const ReactDOM = (window.ReactDOM = React.__internalReactDOM);

const EditorDemo = require("./editor-demo.jsx");
const RendererDemo = require("./renderer-demo.jsx");
const ArticleDemo = require("./article-demo.jsx");
const MultirendererDemo = require("./multirenderer-demo.jsx");
const ItemDiffDemo = require("./item-diff-demo.jsx");
const ArticleDiffDemo = require("./article-diff-demo.jsx");

<<<<<<< HEAD
// // const query = Perseus.Util.parseQueryString(window.location.hash.substring(1));
// const question = query.content ? JSON.parse(query.content) : defaultQuestion;
// const problemNum = Math.floor(Math.random() * 100);
//
// // React router v20XX
// const path = 'renderer';//window.location.search.substring(1);
// const routes = {
//     // The value is spread across a React.createElement call
//     'renderer': [RendererDemo, {question, problemNum}],
//     'article': [ArticleDemo, {content: question}],
//     'multirenderer': [MultirendererDemo, {item: question}],
//     'item-diff': [ItemDiffDemo, {}],
//     'article-diff': [ArticleDiffDemo, {}],
//     '': [EditorDemo, {question, problemNum}],
// };

Perseus.init({skipMathJax: false, loadExtraWidgets: true})
    .then(function() {
      // $(Exercises).bind("readyForNextProblem gotoNextProblem", function() {
      $(Exercises).bind("gotoNextProblem", function() {

        window.ReactDOM.unmountComponentAtNode(document.getElementById("perseus-container"));
        hideExerciseLoadingBar();
        var question = JSON.parse(window.khanExerciseLoader.currentExercise.data.json);
        var problemNum = Math.floor(Math.random() * 100);
        var questinInfo = [RendererDemo, {question, problemNum}];
        DemoComponent = null;
        DemoComponent = ReactDOM.render(
            React.createElement(...(questinInfo)),
            document.getElementById("perseus-container")
        );

      })
    })
    .then(
        function() {
          // hideExerciseLoadingBar();
        },
        function(err) {
            console.error(err); // @Nolint
        }
    );
