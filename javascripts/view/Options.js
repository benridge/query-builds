Ext.define('rlm.view.Options', {
    extend: 'Ext.Container',
    alias: 'widget.viewoptions',
    cls: 'ctr-options',

    items: [
        {xtype: 'builddefinitioncombobox'},
        {xtype: 'rlmdaterangepicker'},
        {
            xtype: 'button',
            itemId: 'submitButton',
            text: 'Submit',
            cls: 'submit-button'
        }
    ],

    initComponent: function() {
        this.callParent(arguments);
        this.addEvents(
            'submit'
        );
        this.on('afterrender', this._onAfterRender, this);
    },

    _onAfterRender: function() {
        this.mon(this.down('#submitButton'), 'click', this._onSubmitButton, this);
    },

    _onSubmitButton: function() {
        this.fireEvent('submit', this._getOptionValues());
    },

    _getOptionValues: function() {
        var buildCombo = this.down('builddefinitioncombobox'),
            dateRangePicker = this.down('rlmdaterangepicker');

        return {
            build: buildCombo.getValue(),
            fromDate: dateRangePicker.getFromDate(),
            toDate: dateRangePicker.getToDate()
        };
    }


});