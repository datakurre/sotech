// Copyright 2008-2011 University of Jyväskylä
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
/*globals SoTech Endash*/

require("views/table_header");
require("views/table_column");

/** @class

  SoTech.TableView

  @extends SC.View
*/
SoTech.TableView = SC.View.extend(
/** @scope SoTech.TableView.prototype */ {

  classNames: "st-table-view".w(),

  headerView: SoTech.TableHeaderView,
  columnView: SoTech.TableColumnView,

  acceptsFirstResponder: YES,
  showAlternatingRows: YES,

  rowHeight: 18,
  
  columnHeaders: [],
  columnWidths: [],
  columnAligns: [],
  columnValueKeys: [],
  columnOrderable: [],
  
  dragContent: null,
  proposedInsertionIndex: null,
  proposedDropOperation: null,

  init: function() {

    var offset = 0, index = 0, header, width, align, orderable,

        columnHeaders = this.get("columnHeaders") || [],
        columnWidths = this.get("columnWidths") || [],
        columnAligns = this.get("columnAligns") || [],
        columnValueKeys = this.get("columnValueKeys") || [],
        columnOrderable = this.get("columnOrderable") || [],
        headerView = this.get("headerView"),
        columnView = this.get("columnView"),
        
        tableFromScroll = ".parentView.parentView",
        tableFromColumn = ".parentView.parentView.parentView.parentView";

    this["childViews"] = columnValueKeys.map(function(key) {

      header = columnHeaders.shiftObject() || "_%@".fmt(key).loc();
      width = columnWidths.shiftObject() || 150; offset += width;
      align = columnAligns.shiftObject() || SC.ALIGN_LEFT;
      orderable = columnOrderable.shiftObject() ? YES : NO;
      
      index = index + 1;

      return SC.View.extend({

        layout: index == columnValueKeys.get("length")
          ? { top: 0, bottom: 0, left: offset-width, right: 0 }
          : { top: 0, bottom: 0, left: offset-width, width: width },
        useAbsoluteLayout: YES,

        childViews: "header rows".w(),

        header: headerView.extend({ 
          layout: { height: 20, top: 0, right: 0, left: 0,
                    borderBottom: 1, borderRight: 1 },
          sortKey: orderable ? key : null, title: header
        }),

        rows: SC.ScrollView.extend({
          layout: { top: 20, right: 0, bottom: 0, left: 0 },
          classNames: index != columnValueKeys.get("length")
                      ? "st-hide-scroll".w() : "st-show-scroll".w(),

          contentView: index == 1 ? columnView.extend({
            // the leftmost column
            contentIconKeyBinding: "%@.contentIconKey".fmt(tableFromColumn),
            hasContentIconBinding: "%@.hasContentIcon".fmt(tableFromColumn),
            contentValueKey: key,
            textAlign: align
            //
          }) : index != columnValueKeys.get("length") ? columnView.extend({
            // all the middle columns
            classNames: "st-hide-disclosure".w(),
            contentValueKey: key,
            textAlign: align
            //
          }) : columnView.extend({
            // the rightmost column
            classNames: "st-hide-disclosure".w(),
            contentRightIconKeyBinding: "%@.contentRightIconKey".fmt(tableFromColumn),
            hasContentRightIconBinding: "%@.hasContentRightIcon".fmt(tableFromColumn),
            contentValueKey: key,
            textAlign: align
            //
          }),

          verticalScrollOffsetBinding: "%@.verticalScrollOffset".fmt(tableFromScroll),

          horizontalScrollerView: SC.ScrollerView.design({
            isEnabledBinding: "%@.parentView.isEnabled".fmt(tableFromScroll)
          }),
          
          verticalScrollerView: SC.ScrollerView.design({
            isEnabledBinding: "%@.parentView.isEnabled".fmt(tableFromScroll)
          })
        })
      });
    }, this);

    return sc_super();
  },

  isEnabledObserver: function() {
    if (this.get("isEnabled")) {
      this.$().removeClass("disabled");
    } else {
      this.$().addClass("disabled");
    }
  }.observes("isEnabled"),

  reorderDataType: function() {
    return "SoTech.TableView.Reorder.%@".fmt(SC.guidFor(this));
  }.property().cacheable(),
  
  columnIndexes: function() {
    var childViews = this.get("childViews");
    return SC.IndexSet.create(0, childViews.get("length"))
      .filter(function(i) { return !SC.none(childViews[i].rows); }, this);    
  }.property().cacheable(),

  hasFirstResponder: function() {
    var childViews = this.get("childViews");
    return childViews.some(function(column) {
      return !SC.none(column.rows) && column.rows.contentView.isFirstResponder;
    }, this);
  }.property(),

  didBecomeFirstResponder: function() {
    var selection = this.get("selection"),
        childViews = this.get("childViews");
    if (!SC.none(selection) && selection.get("length") === 0) {
      this.set("selection", selection.copy().add(this.get("content"), 0, 1));
    }
    this.$(".sc-list-view").addClass("focus");
    childViews.firstObject().rows.contentView.becomeFirstResponder();
  },

  showInsertionPoint: function(itemView, dropOperation) {
    this.get("columnIndexes").forEach(function(i) {
      this.childViews[i].rows.contentView._showInsertionPoint(itemView, dropOperation);
    }, this);
  },

  hideInsertionPoint: function(itemView, dropOperation) {
    this.get("columnIndexes").forEach(function(i) {
      this.childViews[i].rows.contentView._hideInsertionPoint(itemView, dropOperation);
    }, this);
  },

  // Modified from SC.CollectionView._cv_dragViewFor
  _tv_dragViewFor: function(indexes, context) {  

    var top = context.getPath("parentView.parentView.layout.top"),
        scroll = this.get("verticalScrollOffset") || 0, offset;
    
    var columnIndexes = this.get("columnIndexes"),
        itemView, isSelected, layer;

    var view = SC.View.create({ 
      // layer has the stuff that gets drawn in this hacky ghost...
      layer: this.get("layer").cloneNode(false),
      parentView: this
    });

    //  CSS cleanup
    SC.$(view.get("layer")).css({
      backgroundColor: "transparent", border: "none", left: 0
    }).attr("id", null).find("*").attr("id", null);

    indexes.forEach(function(i) {
      columnIndexes.forEach(function(ci) {
        itemView = this.childViews[ci].rows.contentView.itemViewForContentIndex(i);

        // render item view without isSelected state.  
        if (itemView) {
          isSelected = itemView.get("isSelected");
          itemView.set("isSelected", NO);
          itemView.updateLayerIfNeeded();

          layer = itemView.get("layer");
          if (!SC.none(layer)) {
            layer = layer.cloneNode(true);

            //  CSS cleanup
            offset = parseInt(SC.$(layer).css("top").replace(/px$/,''), 10)
                     + top - scroll;

            SC.$(layer).css({
              backgroundColor: "transparent",
              left: this.childViews[ci].layout.left,
              width: this.childViews[ci].layout.width,
              top: offset
            }).attr("id", null).find("*").attr("id", null);

            if (ci > 0) {
              SC.$(layer).find("label").css("left", 0);          
              SC.$(layer).find("img.disclosure").remove();
              SC.$(layer).find(".sc-outline").css("left", 0);          
            }

            if (layer) view.get("layer").appendChild(layer);
          }

          itemView.set("isSelected", isSelected);
          itemView.updateLayerIfNeeded();
        }
      }, this);
    }, this);

    return view;
  }
});