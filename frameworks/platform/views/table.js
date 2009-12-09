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
/*globals SoTech Endash*/

require("views/table_header");
require("views/table_list");

/** @class

  SoTech.TableView

  @extends Endash.SplitView
*/
SoTech.TableView = Endash.SplitView.extend(SC.Border,
/** @scope SoTech.TableView.prototype */ {

  classNames: "st-table-view".w(),

  headerView: SoTech.TableHeaderView,
  
  listView: SoTech.TableListView,

  acceptsFirstResponder: YES,

  showAlternatingRows: YES,

  dividerThickness: 5,

  dividerSpacing: 0,
  
  contentValueWidths: [],
  
  contentValueAligns: [],
  
  contentValueKeys: [],
  
  contentOrderableBy: [],
  
  init: function() {
    var contentValueWidths = this.get("contentValueWidths") || [], left = 0,
        contentValueAligns = this.get("contentValueAligns") || [],
        contentOrderableBy = this.get("contentOrderableBy") || [];

    var columns = this.get("contentValueKeys").map( function(key) {
      var width = contentValueWidths.shiftObject() || 150; left += width;
      var align = contentValueAligns.shiftObject() || SC.ALIGN_LEFT;
      var orderable = contentOrderableBy.shiftObject();
      return { key: key, title: "_%@".fmt(key),
               orderable: SC.none(orderable) ? YES : orderable,
               left: left-width, width: width, align: align } ;
    }) ;

    var headerView = this.get("headerView") ;
    var listView = this.get("listView") ;

    this["childViews"] = columns.map( function(column) {
      return SC.View.extend({
        layout: { width: column.width, minWidth: 20,
                  top: 0, bottom: 0, left: column.offset },
        childViews: "header rows".w(),

        header: headerView.extend({ 
          layout: { height: 20, top: 0, right: 0, left: 0 },
          sortKey: column.orderable ? column.key : null,
          title: column.title.loc()
        }),

        rows: SC.ScrollView.extend({
          layout: { top: 21, right: 0, bottom: 0, left: 0 },
          borderStyle: SC.BORDER_NONE,
          backgroundColor: "white",
          classNames: columns.indexOf(column) < columns.get("length") - 1 ?
                      "st-hide-scroll" : "st-show-scroll",
          verticalScrollOffsetBinding: ".parentView.parentView.verticalScrollOffset",

          contentView: columns.indexOf(column) === 0 ? listView.extend({
            contentIconKeyBinding: ".parentView.parentView.parentView.parentView.contentIconKey",
            hasContentIconBinding: ".parentView.parentView.parentView.parentView.hasContentIcon",
            contentValueKey: column.key,
            textAlign: column.align
          }) : listView.extend({
            classNames: "st-hide-disclosure",
            contentValueKey: column.key,
            textAlign: column.align
          })
        })
      }) ;
    }, this) ;
    return sc_super();
  },

  hasFirstResponder: function() {
    return this.get("childViews").some( function(column) {
      return !SC.none(column.rows) && column.rows.contentView.isFirstResponder ;
    }, this) ;
  }.property(),

  didBecomeFirstResponder: function() {
    this.$(".sc-list-view").addClass("focus") ;
    this.get("childViews").firstObject().rows.contentView.becomeFirstResponder() ;
    var selection = this.get("selection") ;
    if (selection && !selection.get("length")) {
      this.set("selection", this.get("selection").copy().add(this.get("content"),0,1)) ;
    }
  },

  _sttv_dragViewFor: function(indexes, context) {
    var dragLayer = this.get("layer").cloneNode(false) ;
    var view = SC.View.create({ layer: dragLayer, parentView: this }) ;

    // collects the columns
    var columns = this.childViews.filter(function(child) { return !SC.none(child.rows) ; }) ;
    var columnIndexes = SC.IndexSet.create(0, columns.get("length")) ;

    // cleanup weird stuff that might make the drag look out of place
    SC.$(dragLayer).css("background-color", "transparent")
      .css("border", "none")
      .css("top", columns[0].rows.layout.top)
      .css("left", 0) ;
  
    indexes.forEach(function(i) {
      columnIndexes.forEach(function(ci) {
        var itemView = columns[ci].rows.contentView.itemViewForContentIndex(i),
            isSelected, layer ;

        // render item view without isSelected state.  
        if (itemView) {
          isSelected = itemView.get("isSelected") ;
          itemView.set("isSelected", NO) ;

          itemView.updateLayerIfNeeded();
          layer = itemView.get("layer");
          if (layer) layer = layer.cloneNode(true);

          // cleanup weird stuff that might make the drag look out of place
          SC.$(layer).css("background-color", "transparent")
                     .css("left", columns[ci].layout.left)
                     .css("width", columns[ci].layout.width) ;
          if (ci > 0) {
            SC.$(layer).find("img").remove() ;
            SC.$(layer).find("label").css("left", 0) ;          
            SC.$(layer).find(".sc-outline").css("left", 0) ;          
          }
          itemView.set("isSelected", isSelected);
          itemView.updateLayerIfNeeded();
        }

        if (layer) dragLayer.appendChild(layer);
        layer = null;      
      }) ;
    }) ;

    dragLayer = null ;
    return view ;
  }
});