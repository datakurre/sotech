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

require('views/table_list');

/** @class

  SoTech.TableView

  @extends Endash.SplitView
*/
SoTech.TableView = Endash.SplitView.extend(
/** @scope SoTech.TableView.prototype */ {

  acceptsFirstResponder: true,
  
  classNames: "st-table-view".w(),

  dividerThickness: 3,

  dividerSpacing: 0,
  
  listView: SoTech.TableListView,
  
  init: function() {
    var contentValueWidths = this.get("contentValueWidths"), left = 0;
    var columns = this.get("contentValueKeys").map( function(key) {
      var width = contentValueWidths.shiftObject() || 150; left += width;
      return { key: key, title: "_%@".fmt(key), left: left-width, width: width } ;
    }) ;

    this["childViews"] = columns.map( function(column) {
      return SC.View.extend({
        layout: { width: column.width, top: 0, bottom: 0, left: column.offset },
        childViews: "header rows".w(),
        header: SC.ButtonView.extend({
          layout: { height: 20, top: 0, right: 0, left: 0 },
          classNames: "st-header-view".w(),
          theme: "disclosure",
          sortKey: column.key,
          title: column.title.loc(),
          action: function() {
            var sortKey = this.get("sortKey") ;
            var orderBy = this.parentView.parentView.get("orderBy") ;
            this.parentView.parentView.set("orderBy", (orderBy == sortKey ? "%@ DESC" : "%@").fmt(sortKey)) ;
            this.parentView.parentView.$(".st-header-view").removeClass("selected") ;
          },
          render: function(context, firstTime) {
            context.push('<img src="', SC.BLANK_IMAGE_URL, '" class="button" alt="" />');
            context.push("<label>",this.get("title"),"</label>");

            var sortKey = this.get("sortKey") ;
            var orderBy = this.parentView.parentView.get("orderBy") ;
            if (!SC.none(orderBy) && orderBy.substring(0, sortKey.length) == sortKey) {
              context.addClass("selected") ;
              if (orderBy == sortKey) { context.removeClass("descending") ; }
              else { context.addClass("descending") ; }
            }
          }
        }),
        rows: SC.ScrollView.extend({
          layout: { top: 20, right: 0, bottom: 0, left: 0 },
          backgroundColor: "white",
          classNames: columns.indexOf(column) < columns.get("length") - 1 ?
                      "st-hide-scroll" : "st-show-scroll",
          verticalScrollOffsetBinding: ".parentView.parentView.verticalScrollOffset",
          contentView: columns.indexOf(column) === 0 ? this.listView.extend({
            contentIconKeyBinding: ".parentView.parentView.parentView.parentView.contentIconKey",
            hasContentIconBinding: ".parentView.parentView.parentView.parentView.hasContentIcon",
            contentValueKey: column.key
          }) : this.listView.extend({
            classNames: "st-hide-disclosure",
            contentValueKey: column.key
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
  }
});