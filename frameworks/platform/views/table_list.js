// Copyright 2008-2009 University of Jyväskylä
//
// Authors:
//     Asko Soukka <asko.soukka@iki.fi>
//     Sacha Helfenstein <sh@jyu.fi>
//
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation files
// (the "Software"), to deal in the Software without restriction,
// including without limitation the rights to use, copy, modify, merge,
// publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
// CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
/*globals SoTech*/

/** @class

  SoTech.TableListView

  @extends SC.ListView
*/
SoTech.TableListView = SC.ListView.extend(
/** @scope SoTech.TableListView.prototype */ {
  // .parentView.parentView.parentView.parentView is
  // [SC.ContainerView].[SC.ScrollView].[SC.SplitViewPane].[SoTech.TableView]
  contentBinding: ".parentView.parentView.parentView.parentView.content",
  selectionBinding: ".parentView.parentView.parentView.parentView.selection",

  canEditContentBinding: ".parentView.parentView.parentView.parentView.canEditContent",
  canDeleteContentBinding: ".parentView.parentView.parentView.parentView.canDeleteContent",
  showAlternatingRowsBinding: ".parentView.parentView.parentView.parentView.showAlternatingRows",

  canReorderContentBinding: ".parentView.parentView.parentView.parentView.canReorderContent",
  isDropTargetBinding: ".parentView.parentView.parentView.parentView.isDropTarget",

  delegateBinding: ".parentView.parentView.parentView.parentView.delegate",
  targetBinding: ".parentView.parentView.parentView.parentView.target",
  actionBinding: ".parentView.parentView.parentView.parentView.action",

  textAlign: SC.ALIGN_LEFT,

  exampleView: SC.ListItemView.extend({
    textAlignBinding: ".parentView.textAlign",
    render: function(context, firstTime) { sc_super();
      var textAlign = this.get("textAlign") || SC.ALIGN_LEFT ;
      context.addStyle('text-align',  this.get('textAlign')) ;
    }
  }),

  render: function(context, firstTime) { sc_super() ;
    context.setClass("focus", this.parentView.parentView.parentView.parentView.get("hasFirstResponder")) ;
  },
  didBecomeFirstResponder: function() { sc_super() ;
    this.parentView.parentView.parentView.parentView.$(".sc-list-view").addClass("focus") ;
  },
  willLoseFirstResponder: function() { sc_super() ;
    this.parentView.parentView.parentView.parentView.$(".sc-list-view").removeClass("focus") ;
  },
  _cv_dragViewFor: function(dragContent) {
    // find only the indexes that are in both dragContent and nowShowing.
    var indexes = this.get('nowShowing').without(dragContent);
    indexes = this.get('nowShowing').without(indexes);

    return this.parentView.parentView.parentView.parentView._tv_dragViewFor(indexes, this) ;
  }
}) ;