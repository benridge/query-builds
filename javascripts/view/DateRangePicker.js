Ext.define('rlm.view.DateRangePicker', {
    extend: 'Ext.Container',
    alias: 'widget.rlmdaterangepicker',

    items: [
        {
            xtype: 'datefield',
            itemId: 'fromDate',
            name: 'fromDate',
            fieldLabel: 'From',
            maxValue: new Date(),
            value: moment().subtract('days', 14).toDate()
        },
        {
            xtype: 'datefield',
            itemId: 'toDate',
            fieldLabel: 'To',
            name: 'toDate',
            maxValue: new Date(),
            value: new Date()
        }
    ],

    getFromDate: function() {
        return this.down('#fromDate').getValue();
    },

    getToDate: function() {
        return this.down('#toDate').getValue();
    }
});