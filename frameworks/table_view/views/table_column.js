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

  SoTech.TableColumnView

  @extends SC.ListView
*/
SoTech.TableColumnView = SC.ListView.extend(
/** @scope SoTech.TableColumnView.prototype */ {

  contentBinding: ".table.content",
  selectionBinding: ".table.selection",

  canEditContentBinding: ".table.canEditContent",
  canDeleteContentBinding: ".table.canDeleteContent",
  showAlternatingRowsBinding: ".table.showAlternatingRows",

  canReorderContentBinding: ".table.canReorderContent",
  isDropTargetBinding: ".table.isDropTarget",

  delegateBinding: ".table.delegate",
  targetBinding: ".table.target",
  actionBinding: ".table.action",

  rowHeightBinding: ".table.rowHeight",

  isEnabledBinding: ".table.isEnabled",

  textAlign: SC.ALIGN_LEFT,

  dragContentBinding: ".table.dragContent",
  proposedInsertionIndexBinding: ".table.proposedInsertionIndex",
  proposedDropOperationBinding: ".table.proposedDropOperation",

  exampleView: SC.ListItemView.extend({
    textAlignBinding: ".parentView.textAlign",
    render: function(context, firstTime) { sc_super();
      var textAlign = this.get("textAlign") || SC.ALIGN_LEFT;
      context.addStyle('text-align', textAlign);
    }
  }),

  table: function() {
    return this.getPath("parentView.parentView.parentView.parentView");
  }.property().cacheable(),

  render: function(context, firstTime) { sc_super();
    context.setClass("focus", this.getPath("table.hasFirstResponder"));
  },

  moveRight: function() {
    var columns = this.getPath("table.childViews"),
        index = columns.indexOf(this.getPath("parentView.parentView.parentView"));
    if (index < columns.get("length") - 1) {
      columns[index + 1].rows.contentView.becomeFirstResponder();
    }
  },

  moveLeft: function() {
    var columns = this.getPath("table.childViews"),
        index = columns.indexOf(this.getPath("parentView.parentView.parentView"));
    if (index > 0) {
      columns[index - 1].rows.contentView.becomeFirstResponder();
    }
  },

  selectionChanged: function() {
    var sel = this.get("selection"),
        editable = this.get("canEditContent");
    if (editable && this.get("isFirstResponder")
        && !SC.none(sel) && sel.get("length") === 1) {
      this.get("classNames").pushObject("st-cursor");
      this.$().addClass("st-cursor");
    } else {
      this.set("classNames", this.get("classNames").without("st-cursor"));
      this.$().removeClass("st-cursor");
    }
  }.observes("selection", "isFirstResponder"),

  didBecomeFirstResponder: function() { sc_super();
    this.get("pane")._pendingResponder = null;  // stop bubling

    this.get("table").$(".sc-list-view").addClass("focus");
    this.get("table").propertyDidChange("hasFirstResponder");
  },

  willLoseFirstResponder: function() { sc_super();
    this.get("table").$(".sc-list-view").removeClass("focus");
    this.get("table").propertyDidChange("hasFirstResponder");
  },

  reorderDataType: function() {
    return this.getPath("table.reorderDataType");
  }.property().cacheable(),

  showInsertionPoint: function(itemView, dropOperation) {
    this.get("table").showInsertionPoint(itemView, dropOperation);
  },

  hideInsertionPoint: function() {
    this.get("table").hideInsertionPoint();
  },

  _showInsertionPoint: function(itemView, dropOperation) {
    this.showInsertionPoint.base.apply(this, arguments);
  },

  _hideInsertionPoint: function(itemView, dropOperation) {
    this.hideInsertionPoint.base.apply(this, arguments);
  },

  _cv_dragViewFor: function(dragContent) {
    // find only the indexes that are in both dragContent and nowShowing.
    var indexes = this.get("nowShowing").without(dragContent);
    indexes = this.get("nowShowing").without(indexes);
    // get a custom view from TableView
    return this.get("table")._tv_dragViewFor(indexes, this);
  },

  ghostActsLikeCursor: NO

});
