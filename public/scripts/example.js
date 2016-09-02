/**
 * This file provided by Facebook is for non-commercial testing and evaluation
 * purposes only. Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */


 var ResultPoint = React.createClass({
   getInitialState: function() {
     return { status:false };
   },

   render: function() {
     let speed=2;
     let delay = (this.props.id*7)/speed;
     if (this.props.status)
     {
       let className = "circle circle_fill green filled " + "class" + this.props.id;
       return (
         <div>
          <style dangerouslySetInnerHTML={{
            __html: [
               '.' + "class" + this.props.id + '::before {',
               'animation-delay: ' + (delay).toString() + 's;',
               '}'
              ].join('\n')
            }}>
          </style>
          <div className={className}>
          </div>
        </div>
       );
     }
     else {
       return (
         <div className="circle disabled empty"></div>
       );
     }
   }
 });

 var Bar = React.createClass({
   render() {
     let speed=2;
     let delay = (this.props.id*7-2.15) / speed;
     if (this.props.status == true) {
       let className = "bar bar_fill green filled " + "barClass" + this.props.id;
       return (
         <div>
          <style dangerouslySetInnerHTML={{
            __html: [
               '.'  + "barClass" + this.props.id + '::before {',
               'animation-delay: ' + (delay).toString() + 's;',
               '}'
              ].join('\n')
            }}>
          </style>
          <div className={className}>
          </div>
        </div>
       );
     }
     else {
       return (
         <div className="bar disabled empty"></div>
       );
     }
   }
 });

var ResultList = React.createClass({

  render() {
    var derp = this;
    var resultNodes = this.props.data.map(function(participant, index) {
      return (
        <div className={"result " + "key" + participant.id.toString()}  key={participant.id}>
          <div className="name">
              {participant.author}
          </div>
          {/*Loop this shit */}
          <ResultPoint status={participant.TASK1} id={derp.animationLengths[index][0]} />
          <Bar status={participant.TASK2} id={derp.animationLengths[index][1]} />
          <ResultPoint status={participant.TASK2} id={derp.animationLengths[index][1]} />
          <Bar status={participant.TASK3} id={derp.animationLengths[index][2]} />
          <ResultPoint status={participant.TASK3} id={derp.animationLengths[index][2]} />
        </div>
      );
    });

    return (
      <div className="resultList">
        <div className ="labels">
          <div className ="label">
            Task1
          </div>
          <div className ="label">
            task2
          </div>
          <div className ="label">
            task3
          </div>
        </div>
        {resultNodes}
      </div>
    );
  },

  componentWillUpdate: function(nextProps, nextState) {
    let temp = this.animationLengths;
    this.animationLengths = Array(nextProps.data.length).fill(Array(3).fill(0));
    for (var i = 0; i < nextProps.data.length; i++) {
        let oldCompletes = [false, false, false];
        if (this.props.data[i] != undefined) {
          oldCompletes = [this.props.data[i].TASK1, this.props.data[i].TASK2, this.props.data[i].TASK3];
        }
        let newCompletes = [nextProps.data[i].TASK1, nextProps.data[i].TASK2, nextProps.data[i].TASK3];
        if (!oldCompletes.equals(newCompletes))
        {
          let delay = 0;
          for (let j = 0; j < newCompletes.length; j++)
          {
            let oldValue = oldCompletes[j];
            let newValue = newCompletes[j];
            if (oldValue == false && newValue == true)
            {
              this.animationLengths[i][j] = delay;
              delay++;
            }
            else
            {
              this.animationLengths[i][j] = 0;
                //Same values, or one is null
            }
            if (j == 0)
              delay = 1;
          }
        }
        else {
          if (temp != undefined)
            this.animationLengths = temp;
        }
    }

  }
});

var ResultBox = React.createClass({
  loadparticipantsFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleparticipantSubmit: function(participant) {
    var participants = this.state.data;
    // Optimistically set an id on the new participant. It will be replaced by an
    // id generated by the server. In a production application you would likely
    // not use Date.now() for this and would have a more robust system in place.
    participant.id = Date.now();
    var newparticipants = participants.concat([participant]);
    this.setState({data: newparticipants});
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: participant,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({data: participants});
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    console.log("I mounted");
    this.loadparticipantsFromServer();
    setInterval(this.loadparticipantsFromServer, this.props.pollInterval);
  },

  render: function() {
    return (
      <div className="participantBox">
        <h1>Results</h1>
          <ResultList data={this.state.data} />
      </div>
    );
  }

  /*render: () => {
    return (
      <div className="resultBox">
      <h1>"Hullo"</h1>
        <ResultList data={this.state.data} />
      </div>
    );
  }*/
});

ReactDOM.render(
  <ResultBox url="/api/comments" pollInterval={1000} />,
  document.getElementById('content')
);
