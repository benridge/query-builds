Ext.define('rlm.view.AppPanel', {
    extend: 'Ext.Container',
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
        this.mon(this.down('viewoptions'), 'setvalue', this._onBuildComboValueSet, this, {single: true});
    },


    _onOptionsSubmit: function(optionValues) {
        this.down('rlmresultsdisplay').showMask();
        this.buildData.query(optionValues, this._withQueryResults, this);
    },

    _withQueryResults: function(builds) {
        var resultsController = Ext.create('rlm.controller.ResultsController'),
            resultsDisplay = this.down('rlmresultsdisplay');

        resultsController.updateResults(builds, resultsDisplay);
        this.down('rlmresultsdisplay').hideMask();
    },

    _onBuildComboValueSet: function() {
        this.down('viewoptions').clickSubmitButton();
    }
});