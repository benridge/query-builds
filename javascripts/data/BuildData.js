Ext.define('rlm.data.BuildData', {

    requires: [
        'Rally.data.wsapi.Filter'
    ],

    buildStore: null,

    constructor: function() {
        this.buildStore = Ext.create('Rally.data.WsapiDataStore', {
            model: 'Build',
            fetch: true,
            autoLoad: false,
            context: {
                project: null
            },
            limit: Infinity,

            /**
             * @Override to fix PageableStore bug where pages 2-n do not apply store's filters
             * @private
             */

            _loadNext: function(records, operation, success, origCallback, origScope) {
                if (this._shouldLoadMorePages(operation)) {
                    this._loadNextPage(Ext.bind(this._loadNext, this, [origCallback, origScope], true), operation.filters);
                } else {
                    this._afterDoneLoadingAllPages(operation, success, origCallback, origScope);
                }
            },

            /**
             * @Override
             * @private
             */
            _loadNextPage: function(callback, filters) {
                this.loading = true;
                this.nextPage({
                    filters: filters,
                    addRecords: true,
                    callback: callback,
                    isPaging: true
                });
            }
        });
        this.callParent(arguments);
    },

    query: function(options, callback, callbackScope) {
        var filter,
            filterCfg = [];

        if (options.build) {
            filterCfg.push({
                property: 'BuildDefinition',
                operator: '=',
                value: options.build
            });
        } else {
            return;
        }

        if (options.fromDate) {
            filterCfg.push({
                property: 'Start',
                operator: '>=',
                value: this._getFormattedDate(options.fromDate)
            });
        }

        if (options.toDate) {
            filterCfg.push({
                property: 'Start',
                operator: '<=',
                value: this._getFormattedDate(new moment(options.toDate).add('days', 1))
            });
        }

        filter = Rally.data.wsapi.Filter.and(filterCfg);

        this.buildStore.load({
            filters: [filter],
            callback: callback,
            scope: callbackScope
        });

    },

    _getFormattedDate: function(date) {
        return moment(date).format('YYYY-MM-DD');
    }

});