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
/*globals SoTech*/

/** @class

  SoTech.TableHeaderView

  @extends SC.ButtonView
*/
SoTech.TableHeaderView = SC.ButtonView.extend(
/** @scope SoTech.TableHeaderView.prototype */ {
  classNames: "st-header-view".w(),
  theme: "disclosure",
  acceptsFirstResponder: NO,

  sortKey: "guid",
  title: "guid",

  isEnabledBinding: ".table.isEnabled",
  
  table: function() {
    return this.getPath("parentView.parentView");
  }.property().cacheable(),

  action: function() {
    var sortKey = this.get("sortKey"),
        table = this.get("table"),
        orderBy = table.get("orderBy");
    if (sortKey) {
      table.set("orderBy", (orderBy == sortKey ? "DESC %@" : "%@").fmt(sortKey));
      table.$(".st-header-view").removeClass("st-order-by");
    }
  },

  render: function(context, firstTime) {
    var sortKey = this.get("sortKey"),
        orderBy = this.getPath("table.orderBy");

    context.push('<img src="', SC.BLANK_IMAGE_URL, '" class="button" alt="" />');
    context.push("<label>",this.get("title"),"</label>");

    if (sortKey) {
      context.addClass("st-orderable");
      if (!SC.none(orderBy) && orderBy.replace(/^DESC\s/, "") == sortKey) {
        context.addClass("st-order-by");
        if (orderBy == sortKey) { context.removeClass("st-descending"); }
        else { context.addClass("st-descending"); }
      }
    }
  }
});