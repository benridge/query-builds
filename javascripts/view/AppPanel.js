Ext.define('rlm.view.AppPanel', {
    extend: 'Ext.panel.Panel',
    title: 'Query Metrics for a Build',
    alias: 'widget.appPanel',
    layout: {
        type: 'hbox'
    },

    defaults: {
        border: 1
    },
    items: [
        {
            xtype: 'viewoptions'
        },
        {
            xtype: 'rlmresultsdisplay'
        }
    ],

    initComponent: function() {
        this.callParent(arguments);
        this.on('afterrender', this._afterRender, this);
        this.buildData  = Ext.create('rlm.data.BuildData');
    },

    _afterRender: function() {
        this.mon(this.down('viewoptions'), 'submit', this._onOptionsSubmit, this);
    },


    _onOptionsSubmit: function(optionValues) {
        var resultsDisplay = this.down('rlmresultsdisplay'),
            resultsController = Ext.create('rlm.controller.ResultsController');

        this.buildData.query(optionValues).always(function(builds) {
            resultsController.updateResults(builds, resultsDisplay);
        });
    }
});