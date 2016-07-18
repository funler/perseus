/**
  * Demonstrates the rendered result of a Perseus question
  *
  * This mounts the ItemRenderer and adds functionality to
  * show hints and mark answers
  */

const React = require("react");
const {StyleSheet, css} = require("aphrodite");
const ReactDOM = require("react-dom");

const ApiClassNames = require("./perseus-api.jsx").ClassNames;
const ItemRenderer = require("./item-renderer.jsx");
const SimpleButton = require("./simple-button.jsx");

const defaultQuestion = {
    question: {
        content: "",
        images: {},
        widgets: {},
    },
    answerArea: {
        calculator: false,
    },
    itemDataVersion: {
        major: 0,
        minor: 1,
    },
    hints: [],
};

const RendererDemo = React.createClass({
    hintsUsed: 0,
    propTypes: {
        problemNum: React.PropTypes.number,
        question: React.PropTypes.any.isRequired,
    },

    getDefaultProps: function() {
        return {
            question: defaultQuestion,
            problemNum: 1,
        };
    },

    getInitialState: function() {
        return {
            // Matches ItemRenderer.showInput
            answer: {empty: true, correct: null},
            scratchpadEnabled: true,
            isMobile: navigator.userAgent.indexOf("Mobile") !== -1,
        };
    },

    componentDidMount: function() {
        ReactDOM.findDOMNode(this.refs.itemRenderer).focus();

        window.addEventListener("resize", this._handleResize);
    },

    componentWillUnmount: function() {
        window.removeEventListener("resize", this._handleResize);
    },

    onScore: function() {
        console.log(this.refs.itemRenderer.scoreInput()); // eslint-disable-line no-console
    },

    clearScratchpad: function() {
      if(this.pad) {
        this.pad.clear();
      }
    },

    toggleScratchpad: function() {
      if(this.scratchpadVisible)
        this.hideScratchpad();
      else
        this.showScratchpad();
    },

    hideScratchpad: function() {
      if(!this.scratchpadVisible) return;

      $("#scratchpad").hide();
      // Un-outline things floating on top of the scratchpad
      $(".above-scratchpad").css("border", "");
      $("#scratchpad-show").text(i18n._("Show scratchpad"));
      this.scratchpadVisible = false;
    },

    showScratchpad: function() {
      if(this.scratchpadVisible) return;

      if (!$("#scratchpad").length) {
          // Scratchpad's gone! The exercise template
          // probably isn't on screen right now, so let's
          // just not try and initialize stuff otherwise
          // Raphael will attach an <svg> to the body.
          return;
      }

      $("#scratchpad").show();
      $("#scratchpad-show").text(i18n._("Hide scratchpad"));

      // If pad has never been created or if it's empty
      // because it was removed from the DOM, recreate a new
      // scratchpad.
      if (!this.pad || !$("#scratchpad div").children().length) {
          this.pad = new DrawingScratchpad(
              $("#scratchpad div")[0]);
      }

      // Outline things floating on top of the scratchpad
      $(".above-scratchpad").css("border", "1px solid #ccc");

      this.scratchpadVisible = true;
    },
    pad : undefined,
    scratchpadVisible: false,

    checkAnswer: function() {
        this.refs.itemRenderer.showRationalesForCurrentlySelectedChoices();
        var input = this.refs.itemRenderer.scoreInput();
        this.setState(
            {
                answer: input,
            },
            () => {
                this.refs.itemRenderer.deselectIncorrectSelectedChoices();
            }
        );
        window.khanExerciseLoader.sendKhanScoreToServer({
          'correct': input.correct ? 1 : 0,
          'wrong': input.correct ? 0 : 1,
          'hintsUsed': this.refs.itemRenderer.hintsRenderer.props.hintsVisible,
          'totalHints': this.refs.itemRenderer.getNumHints(),
          'scratchpadUsed': false
        });
    },

    takeHint: function() {
        this.refs.itemRenderer.showHint();
        window.khanExerciseLoader.useHint();
    },

    _handleResize() {
        const isMobile = navigator.userAgent.indexOf("Mobile") !== -1;
        if (this.state.isMobile !== isMobile) {
            this.setState({isMobile});
        }
    },

    render: function() {
        const {isMobile} = this.state;

        const apiOptions = {
            getAnotherHint: () => {
                this.refs.itemRenderer.showHint();
            },
            isMobile,
            customKeypad: isMobile,
            setDrawingAreaAvailable: enabled => {
                this.setState({
                    scratchpadEnabled: enabled,
                });
            },
            styling: {
                radioStyleVersion: "final",
            },
        };

        const answer = this.state.answer;
        const rendererComponent = (
            <ItemRenderer
                item={this.props.question}
                ref="itemRenderer"
                problemNum={this.props.problemNum}
                initialHintsVisible={0}
                apiOptions={apiOptions}
                reviewMode={answer.correct}
            />
        );

        const showSmiley = !answer.empty && answer.correct;
        const answerButton = (
            <div>
                <SimpleButton
                    color={answer.empty || answer.correct ? "green" : "orange"}
                    onClick={this.checkAnswer}
                >
                    {answer.empty
                        ? "Check Answer"
                        : answer.correct ? "Correct!" : "Incorrect, try again."}
                </SimpleButton>
                <img
                    className={css(
                        styles.smiley,
                        !showSmiley && styles.hideSmiley
                    )}
                    src="perseus/images/face-smiley.png"
                />
            </div>
        );

        const scratchpadEnabled = this.state.scratchpadEnabled;

        if (isMobile) {
            const className = "framework-perseus " + ApiClassNames.MOBILE;
            return (
                <div className={className}>
                    <div className={css(styles.problemAndAnswer)}>
                        {rendererComponent}
                        <div id="problem-area">
                            <div id="workarea" style={{marginLeft: 0}} />
                            <div id="hintsarea" />
                        </div>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="renderer-demo framework-perseus">
                    <div className={css(styles.problemAndAnswer)}>
                        <div id="problem-area">
                            <div id="workarea" />
                            <div id="hintsarea" />
                        </div>
                        <div className={css(styles.answerAreaWrap)}>
                            <div id="answer-area">
                                <div className={css(styles.infoBox)}>
                                    <div id="solutionarea" />
                                    <div className={css(styles.answerButtons)}>
                                        {answerButton}
                                    </div>
                                </div>
                                <div className={css(styles.infoBox)}>
                                    <SimpleButton
                                        color={"orange"}
                                        onClick={this.takeHint}
                                    >
                                        Hint
                                    </SimpleButton>
                                </div>
                            </div>
                        </div>
                        <div style={{clear: "both"}} />
                    </div>
                    <div className="extras" style={{margin: 20}}>
                        <button className={scratchpadEnabled ? '' : 'hide'} onClick={this.toggleScratchpad}>
                        {this.scratchpadVisible ? 'Hide' : 'Show'} Scratchpad
                        </button>
                    </div>
                    {rendererComponent}
                </div>
            );
        }
    },
});

const styles = StyleSheet.create({
    problemAndAnswer: {
        minHeight: 180,
        position: "relative",
    },
    smiley: {
        width: 28,
        position: "absolute",
        top: 7,
        left: 5,
        cursor: "pointer",
    },
    hideSmiley: {
        display: "none",
    },
    answerAreaWrap: {
        margin: "0px -8px 0 0",
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 80,
        zIndex: 10000,
    },
    answerButtons: {
        margin: "0 -10px",
        padding: "10px 10px 0",
        position: "relative",
    },
    infoBox: {
        background: "#eee",
        border: "1px solid #aaa",
        color: "#333",
        marginBottom: 10,
        padding: 10,
        position: "relative",
        zIndex: 10,
        boxShadow: "0 1px 2px #ccc",
        overflow: "visible",
        ":before": {
            content: '" "',
            borderRight: "8px solid transparent",
            borderBottom: "8px solid #cccccc",
            height: 16,
            position: "absolute",
            right: -1,
            top: -24,
        },
    },
});

define(function (require, exports, module) {
  module.exports = RendererDemo;
})
