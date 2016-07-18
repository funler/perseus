 /* eslint-disable no-console */

 /**
  * Demonstrates the rendered result of a Perseus question
  *
  * This mounts the ItemRenderer and adds functionality to
  * show hints and mark answers
  */

const React = require('react');
const { StyleSheet, css } = require('aphrodite');
const ReactDOM = require('react-dom');

const ApiClassNames = require("./perseus-api.jsx").ClassNames;
const ItemRenderer = require('./item-renderer.jsx');
const SimpleButton = require('./simple-button.jsx');

const RendererDemo = React.createClass({

    hintsUsed: 0,
    propTypes: {
        problemNum: React.PropTypes.number,
        question: React.PropTypes.any.isRequired,
    },

    getDefaultProps: function() {
        return {
            problemNum: 1,
        };
    },

    getInitialState: function() {
        return {
            // Matches ItemRenderer.showInput
            answer: { empty: true, correct: null },
        };
    },

    componentDidMount: function() {
        ReactDOM.findDOMNode(this.refs.itemRenderer).focus();
    },

    onScore: function() {
        console.log(this.refs.itemRenderer.scoreInput());
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
        var input = this.refs.itemRenderer.scoreInput();
        this.setState({answer: input});
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

    render: function() {
        const xomManatee = !!localStorage.xomManatee;

        const apiOptions = {
            responsiveStyling: true,
            getAnotherHint: () => {
                this.refs.itemRenderer.showHint();
            },
            xomManatee,
            customKeypad: xomManatee,
        };

        const rendererComponent = <ItemRenderer
            item={this.props.question}
            ref="itemRenderer"
            problemNum={this.props.problemNum}
            initialHintsVisible={0}
            enabledFeatures={{
                highlight: true,
                toolTipFormats: true,
                newHintStyles: true,
                useMathQuill: true,
            }}
            apiOptions={apiOptions}
        />;

        const answer = this.state.answer;
        const showSmiley = !answer.empty && answer.correct;
        const answerButton = <div>
            <SimpleButton
                color={answer.empty || answer.correct ? 'green' : 'orange'}
                onClick={this.checkAnswer}
            >
                {answer.empty ? 'Check Answer' : (
                    answer.correct ? 'Correct!' : 'Incorrect, try again.')}
            </SimpleButton>
            <img
                className={css(styles.smiley, !showSmiley && styles.hideSmiley)}
                src="perseus/images/face-smiley.png"
            />
        </div>;

        const scratchpadEnabled = Khan.scratchpad.enabled;

        if (xomManatee) {
            const className = "framework-perseus " + ApiClassNames.XOM_MANATEE;
            return <div className={className}>
                <div className={css(styles.problemAndAnswer)}>
                    {rendererComponent}
                    <div id="problem-area">
                        <div id="workarea" style={{marginLeft:0}}/>
                        <div id="hintsarea"/>
                    </div>
                </div>
            </div>;
        } else {
            return (
                <div className="renderer-demo framework-perseus">
                    <div className={css(styles.problemAndAnswer)}>
                        <div id="problem-area">
                            <div id="workarea"/>
                            <div id="hintsarea"/>
                        </div>
                        <div className={css(styles.answerAreaWrap)}>
                            <div id="answer-area">
                                <div className={css(styles.infoBox)}>
                                    <div id="solutionarea"></div>
                                    <div className={css(styles.answerButtons)}>
                                    {answerButton}
                                    </div>
                                </div>
                                <div className={css(styles.infoBox)}>
                                    <SimpleButton
                                        color={'orange'}
                                        onClick={this.takeHint}
                                    >
                                        Hint
                                    </SimpleButton>
                                </div>
                            </div>
                        </div>
                        <div style={{clear: "both"}}/>
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
        margin: 20,
        position: "relative",
        border: "1px solid #cccccc",
        borderBottom: "1px solid #aaa",
        boxShadow: "0 1px 3px #ccc",
    },
    smiley: {
        width: 28,
        position: 'absolute',
        top: 7,
        left: 5,
        cursor: 'pointer',
    },
    hideSmiley: {
        display: 'none',
    },
    answerAreaWrap: {
        margin: "0px -8px 0 0",
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 80,
    },
    answerButtons: {
        margin: '0 -10px',
        padding: '10px 10px 0',
        position: 'relative',
    },
    infoBox: {
        background: '#eee',
        border: "1px solid #aaa",
        color: "#333",
        marginBottom: 10,
        padding: 10,
        position: "relative",
        zIndex: 10,
        boxShadow: "0 1px 2px #ccc",
        overflow: "visible",
        ':before': {
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
