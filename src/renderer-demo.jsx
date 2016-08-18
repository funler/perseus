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
      $('#scratchpad-show')[0].value = "Scratchpad";
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
      $('#scratchpad-show')[0].value = "Hide";

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
        var EMPTY_MESSAGE = i18n._("There are still more parts of this question to answer.");
        if(input.empty) {
            setTimeout(function() {
              var first = $('.widget-highlight').addClass('animated bounce').first();
              setTimeout(function() {
                $('.widget-highlight').removeClass('animated bounce');
              }, 1000)
              if(first){
                $('html, body').animate({
                  scrollTop: first.offset().top - (window.innerHeight * 0.7)
                }, 500);
              }
            }, 1);
            var attemptMessage = (input.message != null)  ? input.message : EMPTY_MESSAGE;
            $("#check-answer-results > p").html(attemptMessage).show()
        } else {
          $("#check-answer-results > p").hide();
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
        }
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
                    src="images/face-smiley.png"
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
                        <div id="problemarea">
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
                        <div id="problemarea">
                            <div id="scratchpad">
                              <div style={{zIndex:1, left:0}}></div>
                            </div>
                            <div id="workarea" />
                            <div id="hintsarea" />
                        </div>
                        <div className={css(styles.answerAreaWrap)}>
                            <div id="answer_area">
                                <div className="action-buttons">
                                  <div className="hint-box">
                                    <div id="get-hint-button-container">
                                      <input type="button" onClick={this.takeHint} className="simple-button orange full-width" id="hint" name="hint" value="Hint"></input>
                                    </div>
                                    <span id="hint-remainder"></span>
                                  </div>
                                  <div className={'scratchpad-box ' + (scratchpadEnabled ? '' : 'hide')}>
                                    <div id="get-hint-button-container">
                                      <input type="button" onClick={this.toggleScratchpad} className="simple-button blue full-width" id="scratchpad-show" value={this.scratchpadVisible?'Hide':'Scratchpad'}></input>
                                      <span id="scratchpad-not-available" style={{display:true}}>Scratchpad not available</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="answer-buttons">
                                  <div className="check-answer-wrapper">
                                    <input onClick={this.checkAnswer} type="button" className="submit-answer blue-action" id="check-answer-button" value="Send Answer"></input>
                                  </div>
                                  <span id="show-solution-button-container"></span>
                                  <div id="check-answer-results">
                                    <p className="check-answer-message info-box-sub-description"></p>
                                  </div>
                                </div>

                                <div className="extra-button-box">
                                  <div id="related-video-content">
                                    <button type="button" onClick={window.khanExerciseLoader.showHelpVideo} className="btn btn-default resolve" id="helpme">Helpful Video</button>
                                  </div>
                                </div>

                                <div className="extra-button-box">
                                  <button type="button" id="calc-show-button" onClick={(function() {$('#calculator').show()})} className="show_calculator">calculator</button>
                                </div>

                                <div className="info-box" id="calculator" style={{display:"none"}}>
                                  <div className="calculator-header">
                                      <span className="info-box-header inline">Calculator</span>
                                      <button type="button" id="calc-hide-button" onClick={(function() {$('#calculator').hide()})} className="hide-calculator btn btn-default glyphicon glyphicon-remove"></button>
                                  </div>
                                  <div className="calculator">
                                      <div className="history">
                                          <div id="calc-output">
                                              <div id="calc-output-content" className="fancy-scrollbar"></div>
                                          </div>
                                          <div className="calc-row input">
                                            <input type="text"></input>
                                            <div className="status">
                                              <a href="#" className="calculator-angle-mode" data-behavior="angle-mode"><br></br></a>
                                            </div>
                                          </div>
                                      </div>
                                      <div className="keypad">
                                          <div className="calc-row">
                                          <a href="#" data-text="asin(">sin<sup>-1</sup></a><a href="#" data-text="acos(">cos<sup>-1</sup></a><a href="#" data-text="atan(">tan<sup>-1</sup></a><a href="#" data-behavior="bs">del</a><a href="#" className="dark" data-behavior="clear">ac</a>
                                          </div>
                                          <div className="calc-row">
                                          <a href="#" data-text="sin(">sin</a><a href="#" data-text="cos(">cos</a><a href="#" data-text="tan(">tan</a><a href="#" data-text="sqrt(">√</a><a href="#" data-text="^">x<sup>y</sup></a>
                                          </div>
                                          <div className="calc-row">
                                          <a href="#" data-text="e^">e<sup>x</sup></a><a href="#" data-text="ln(">ln</a><a href="#" data-text="log(">log</a><a href="#" data-text="pi">&pi;</a>
                                          </div>
                                          <div className="calc-row">
                                          <a href="#" className="dark">7</a><a href="#" className="dark">8</a><a href="#" className="dark">9</a><a href="#">(</a><a href="#">)</a>
                                          </div>
                                          <div className="calc-row">
                                          <a href="#" className="dark">4</a><a href="#" className="dark">5</a><a href="#" className="dark">6</a><a href="#" data-text="*">×</a><a href="#" data-text="/">÷</a>
                                          </div>
                                          <div className="calc-row">
                                          <a href="#" className="dark">1</a><a href="#" className="dark">2</a><a href="#" className="dark">3</a><a href="#">+</a><a href="#" data-text="-">−</a>
                                          </div>
                                          <div className="calc-row">
                                          <a href="#" className="dark">0</a><a href="#" className="dark">.</a><a href="#" data-text="ans">ans</a><a href="#" className="wide" data-behavior="evaluate">=</a>
                                          </div>
                                      </div>
                                  </div>
                                </div>




                            </div>
                        </div>
                        <div style={{clear: "both"}} />
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
