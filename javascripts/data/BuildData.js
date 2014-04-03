Ext.define('rlm.data.BuildData', {

    buildStore: null,

    constructor: function() {
        this.buildStore = Ext.create('Rally.data.WsapiDataStore', {
            model: 'Build',
            fetch: true,
            autoLoad: false,
            context: {
                project: null
            },
            limit: Infinity
        });
        this.callParent(arguments);
    },

    query: function(options) {
        var filters = [],
            deferred = new Deft.Deferred();

        if (options.build) {
            filters.push(Ext.create('Rally.data.wsapi.Filter', {
                property: 'BuildDefinition',
                operator: '=',
                value: options.build
            }));
        } else {
            return deferred.reject('No Build chosen.');
        }

        if (options.fromDate) {
            filters.push(Ext.create('Rally.data.wsapi.Filter', {
                property: 'Start',
                operator: '>=',
                value: this._getFormattedDate(options.fromDate)
            }));
        }

        if (options.toDate) {
            filters.push(Ext.create('Rally.data.wsapi.Filter', {
                property: 'Start',
                operator: '<=',
                value: this._getFormattedDate(options.toDate)
            }));
        }

        this.buildStore.load({
            filters: filters,
            callback: function(records, operation, success) {
                if (success) {
                    deferred.resolve(records);
                } else {
                    deferred.reject('Store did not successfully load.');
                }
            }
        });

        return deferred.promise;
    },

    _getFormattedDate: function(date) {
        return moment(date).format('YYYY-MM-DD');
    }

});