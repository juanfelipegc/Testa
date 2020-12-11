sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./PopoverInteractions", "./PopoverInsights", "./PopoverSales",
	"./utilities",
	"sap/ui/core/routing/History"
], function(BaseController, MessageBox, PopoverInteractions, PopoverInsights, PopoverSales, Utilities, History) {
	"use strict";

	return BaseController.extend("com.sap.build.standard.untitledPrototype.controller.Insights", {
		handleRouteMatched: function(oEvent) {
			var sAppId = "App5fc04c5d6e63ee18add5ee5c";

			var oParams = {};

			if (oEvent.mParameters.data.context) {
				this.sContext = oEvent.mParameters.data.context;

			} else {
				if (this.getOwnerComponent().getComponentData()) {
					var patternConvert = function(oParam) {
						if (Object.keys(oParam).length !== 0) {
							for (var prop in oParam) {
								if (prop !== "sourcePrototype" && prop.includes("Set")) {
									return prop + "(" + oParam[prop][0] + ")";
								}
							}
						}
					};

					this.sContext = patternConvert(this.getOwnerComponent().getComponentData().startupParameters);

				}
			}

			var oPath;

			if (this.sContext) {
				oPath = {
					path: "/" + this.sContext,
					parameters: oParams
				};
				this.getView().bindObject(oPath);
			}

		},
		_onLinkPress: function(oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function(fnResolve) {

				this.doNavigate("Menu", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		doNavigate: function(sRouteName, oBindingContext, fnPromiseResolve, sViaRelation) {
			var sPath = (oBindingContext) ? oBindingContext.getPath() : null;
			var oModel = (oBindingContext) ? oBindingContext.getModel() : null;

			var sEntityNameSet;
			if (sPath !== null && sPath !== "") {
				if (sPath.substring(0, 1) === "/") {
					sPath = sPath.substring(1);
				}
				sEntityNameSet = sPath.split("(")[0];
			}
			var sNavigationPropertyName;
			var sMasterContext = this.sMasterContext ? this.sMasterContext : sPath;

			if (sEntityNameSet !== null) {
				sNavigationPropertyName = sViaRelation || this.getOwnerComponent().getNavigationPropertyForNavigationWithContext(sEntityNameSet, sRouteName);
			}
			if (sNavigationPropertyName !== null && sNavigationPropertyName !== undefined) {
				if (sNavigationPropertyName === "") {
					this.oRouter.navTo(sRouteName, {
						context: sPath,
						masterContext: sMasterContext
					}, false);
				} else {
					oModel.createBindingContext(sNavigationPropertyName, oBindingContext, null, function(bindingContext) {
						if (bindingContext) {
							sPath = bindingContext.getPath();
							if (sPath.substring(0, 1) === "/") {
								sPath = sPath.substring(1);
							}
						} else {
							sPath = "undefined";
						}

						// If the navigation is a 1-n, sPath would be "undefined" as this is not supported in Build
						if (sPath === "undefined") {
							this.oRouter.navTo(sRouteName);
						} else {
							this.oRouter.navTo(sRouteName, {
								context: sPath,
								masterContext: sMasterContext
							}, false);
						}
					}.bind(this));
				}
			} else {
				this.oRouter.navTo(sRouteName);
			}

			if (typeof fnPromiseResolve === "function") {
				fnPromiseResolve();
			}

		},
		_onButtonPress: function(oEvent) {

			var sPopoverName = "PopoverInteractions";
			this.mPopovers = this.mPopovers || {};
			var oPopover = this.mPopovers[sPopoverName];

			if (!oPopover) {
				oPopover = new PopoverInteractions(this.getView());
				this.mPopovers[sPopoverName] = oPopover;

				oPopover.getControl().setPlacement("Auto");

				// For navigation.
				oPopover.setRouter(this.oRouter);
			}

			var oSource = oEvent.getSource();

			oPopover.open(oSource);

		},
		_onButtonPress1: function(oEvent) {

			var sPopoverName = "PopoverInsights";
			this.mPopovers = this.mPopovers || {};
			var oPopover = this.mPopovers[sPopoverName];

			if (!oPopover) {
				oPopover = new PopoverInsights(this.getView());
				this.mPopovers[sPopoverName] = oPopover;

				oPopover.getControl().setPlacement("Auto");

				// For navigation.
				oPopover.setRouter(this.oRouter);
			}

			var oSource = oEvent.getSource();

			oPopover.open(oSource);

		},
		_onButtonPress2: function(oEvent) {

			var sPopoverName = "PopoverSales";
			this.mPopovers = this.mPopovers || {};
			var oPopover = this.mPopovers[sPopoverName];

			if (!oPopover) {
				oPopover = new PopoverSales(this.getView());
				this.mPopovers[sPopoverName] = oPopover;

				oPopover.getControl().setPlacement("Auto");

				// For navigation.
				oPopover.setRouter(this.oRouter);
			}

			var oSource = oEvent.getSource();

			oPopover.open(oSource);

		},
		applyFiltersAndSorters: function(sControlId, sAggregationName, chartBindingInfo) {
			if (chartBindingInfo) {
				var oBindingInfo = chartBindingInfo;
			} else {
				var oBindingInfo = this.getView().byId(sControlId).getBindingInfo(sAggregationName);
			}
			var oBindingOptions = this.updateBindingOptions(sControlId);
			this.getView().byId(sControlId).bindAggregation(sAggregationName, {
				model: oBindingInfo.model,
				path: oBindingInfo.path,
				parameters: oBindingInfo.parameters,
				template: oBindingInfo.template,
				templateShareable: true,
				sorter: oBindingOptions.sorters,
				filters: oBindingOptions.filters
			});

		},
		updateBindingOptions: function(sCollectionId, oBindingData, sSourceId) {
			this.mBindingOptions = this.mBindingOptions || {};
			this.mBindingOptions[sCollectionId] = this.mBindingOptions[sCollectionId] || {};

			var aSorters = this.mBindingOptions[sCollectionId].sorters;
			var aGroupby = this.mBindingOptions[sCollectionId].groupby;

			// If there is no oBindingData parameter, we just need the processed filters and sorters from this function
			if (oBindingData) {
				if (oBindingData.sorters) {
					aSorters = oBindingData.sorters;
				}
				if (oBindingData.groupby || oBindingData.groupby === null) {
					aGroupby = oBindingData.groupby;
				}
				// 1) Update the filters map for the given collection and source
				this.mBindingOptions[sCollectionId].sorters = aSorters;
				this.mBindingOptions[sCollectionId].groupby = aGroupby;
				this.mBindingOptions[sCollectionId].filters = this.mBindingOptions[sCollectionId].filters || {};
				this.mBindingOptions[sCollectionId].filters[sSourceId] = oBindingData.filters || [];
			}

			// 2) Reapply all the filters and sorters
			var aFilters = [];
			for (var key in this.mBindingOptions[sCollectionId].filters) {
				aFilters = aFilters.concat(this.mBindingOptions[sCollectionId].filters[key]);
			}

			// Add the groupby first in the sorters array
			if (aGroupby) {
				aSorters = aSorters ? aGroupby.concat(aSorters) : aGroupby;
			}

			var aFinalFilters = aFilters.length > 0 ? [new sap.ui.model.Filter(aFilters, true)] : undefined;
			return {
				filters: aFinalFilters,
				sorters: aSorters
			};

		},
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("Insights").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

			var oView = this.getView(),
				oData = {},
				self = this;
			var oModel = new sap.ui.model.json.JSONModel();
			oView.setModel(oModel, "staticDataModel");
			self.oBindingParameters = {};

			oData["sap_Responsive_Page_0-content-sap_m_ScrollContainer-1606439800549-content-sap_chart_LineChart-1"] = {};

			oData["sap_Responsive_Page_0-content-sap_m_ScrollContainer-1606439800549-content-sap_chart_LineChart-1"]["data"] = [{
				"dim0": "Monday",
				"mea0": "28",
				"Measure1": "24",
				"Measure3": "28",
				"__id": 0
			}, {
				"dim0": "Tuesday",
				"mea0": "33",
				"Measure1": "28",
				"Measure3": "20",
				"__id": 1
			}, {
				"dim0": "Wednesday",
				"mea0": "22",
				"Measure1": "20",
				"Measure3": "27",
				"__id": 2
			}, {
				"dim0": "Thursday",
				"mea0": "28",
				"Measure1": "33",
				"Measure3": "24",
				"__id": 3
			}, {
				"dim0": "Friday",
				"mea0": "26",
				"Measure1": "29",
				"Measure3": "22",
				"__id": 4
			}, {
				"dim0": "Sathurday",
				"mea0": "24",
				"Measure1": "22",
				"Measure3": "15",
				"__id": 5
			}, {
				"undefined": null,
				"dim0": "Sunday",
				"mea0": "8",
				"Measure1": "15",
				"Measure3": "3",
				"__id": 6
			}];

			self.oBindingParameters['sap_Responsive_Page_0-content-sap_m_ScrollContainer-1606439800549-content-sap_chart_LineChart-1'] = {
				"path": "/sap_Responsive_Page_0-content-sap_m_ScrollContainer-1606439800549-content-sap_chart_LineChart-1/data",
				"model": "staticDataModel",
				"parameters": {}
			};

			oData["sap_Responsive_Page_0-content-sap_m_ScrollContainer-1606439800549-content-sap_chart_LineChart-1"]["vizProperties"] = {
				"plotArea": {
					"dataLabel": {
						"visible": true,
						"hideWhenOverlap": true
					}
				}
			};

			oData["sap_Responsive_Page_0-content-sap_m_ScrollContainer-1607023375094-content-sap_chart_StackedColumnChart-1607023397392"] = {};

			oData["sap_Responsive_Page_0-content-sap_m_ScrollContainer-1607023375094-content-sap_chart_StackedColumnChart-1607023397392"]["data"] = [{
				"dim0": "Monday",
				"mea0": "35",
				"mea1": "15",
				"Measure1": "30",
				"__id": 0
			}, {
				"dim0": "Tuesday",
				"mea0": "41",
				"mea1": "20",
				"Measure1": "20",
				"__id": 1
			}, {
				"dim0": "Wednesday",
				"mea0": "30",
				"mea1": "25",
				"Measure1": "14",
				"__id": 2
			}, {
				"dim0": "Thursday",
				"mea0": "45",
				"mea1": "30",
				"Measure1": "10",
				"__id": 3
			}, {
				"dim0": "Friday",
				"mea0": "20",
				"mea1": "20",
				"Measure1": "37",
				"__id": 4
			}, {
				"dim0": "Sathurday",
				"mea0": "25",
				"mea1": "5",
				"Measure1": "31",
				"__id": 5
			}, {
				"dim0": "Sunday",
				"mea0": "13",
				"mea1": "13",
				"Measure1": "0",
				"__id": 6
			}];

			self.oBindingParameters['sap_Responsive_Page_0-content-sap_m_ScrollContainer-1607023375094-content-sap_chart_StackedColumnChart-1607023397392'] = {
				"path": "/sap_Responsive_Page_0-content-sap_m_ScrollContainer-1607023375094-content-sap_chart_StackedColumnChart-1607023397392/data",
				"model": "staticDataModel",
				"parameters": {}
			};

			oData["sap_Responsive_Page_0-content-sap_m_ScrollContainer-1607023375094-content-sap_chart_StackedColumnChart-1607023397392"]["vizProperties"] = {
				"plotArea": {
					"dataLabel": {
						"visible": true,
						"hideWhenOverlap": true
					}
				}
			};

			oData["sap_Responsive_Page_0-content-sap_m_ScrollContainer-1606439795513-content-sap_chart_ColumnChart-1606439821252"] = {};

			oData["sap_Responsive_Page_0-content-sap_m_ScrollContainer-1606439795513-content-sap_chart_ColumnChart-1606439821252"]["data"] = [{
				"dim0": "Monday",
				"mea0": "8",
				"Sales Website": "15",
				"__id": 0
			}, {
				"dim0": "Tuesday",
				"mea0": "4",
				"Sales Website": "10",
				"__id": 1
			}, {
				"dim0": "Wednesday",
				"mea0": "3",
				"Sales Website": "8",
				"__id": 2
			}, {
				"dim0": "Thurday",
				"mea0": "5",
				"Sales Website": "6",
				"__id": 3
			}, {
				"dim0": "Friday",
				"mea0": "12",
				"Sales Website": "12",
				"__id": 4
			}, {
				"dim0": "Sathurday",
				"mea0": "9",
				"Sales Website": "8",
				"__id": 5
			}, {
				"undefined": null,
				"dim0": "Sunday",
				"mea0": "0",
				"Sales Website": "2",
				"__id": 6
			}];

			self.oBindingParameters['sap_Responsive_Page_0-content-sap_m_ScrollContainer-1606439795513-content-sap_chart_ColumnChart-1606439821252'] = {
				"path": "/sap_Responsive_Page_0-content-sap_m_ScrollContainer-1606439795513-content-sap_chart_ColumnChart-1606439821252/data",
				"model": "staticDataModel",
				"parameters": {}
			};

			oData["sap_Responsive_Page_0-content-sap_m_ScrollContainer-1606439795513-content-sap_chart_ColumnChart-1606439821252"]["vizProperties"] = {
				"plotArea": {
					"dataLabel": {
						"visible": true,
						"hideWhenOverlap": true
					}
				}
			};

			oView.getModel("staticDataModel").setData(oData, true);

			function dateDimensionFormatter(oDimensionValue, sTextValue) {
				var oValueToFormat = sTextValue !== undefined ? sTextValue : oDimensionValue;
				if (oValueToFormat instanceof Date) {
					var oFormat = sap.ui.core.format.DateFormat.getDateInstance({
						style: "short"
					});
					return oFormat.format(oValueToFormat);
				}
				return oValueToFormat;
			}

			var aDimensions = oView.byId("sap_Responsive_Page_0-content-sap_m_ScrollContainer-1606439800549-content-sap_chart_LineChart-1").getDimensions();
			aDimensions.forEach(function(oDimension) {
				oDimension.setTextFormatter(dateDimensionFormatter);
			});

			var aDimensions = oView.byId("sap_Responsive_Page_0-content-sap_m_ScrollContainer-1607023375094-content-sap_chart_StackedColumnChart-1607023397392").getDimensions();
			aDimensions.forEach(function(oDimension) {
				oDimension.setTextFormatter(dateDimensionFormatter);
			});

			var aDimensions = oView.byId("sap_Responsive_Page_0-content-sap_m_ScrollContainer-1606439795513-content-sap_chart_ColumnChart-1606439821252").getDimensions();
			aDimensions.forEach(function(oDimension) {
				oDimension.setTextFormatter(dateDimensionFormatter);
			});

		},
		onAfterRendering: function() {

			var oChart,
				self = this,
				oBindingParameters = this.oBindingParameters,
				oView = this.getView();

			oChart = oView.byId("sap_Responsive_Page_0-content-sap_m_ScrollContainer-1606439800549-content-sap_chart_LineChart-1");
			oChart.bindData(oBindingParameters['sap_Responsive_Page_0-content-sap_m_ScrollContainer-1606439800549-content-sap_chart_LineChart-1']);

			oChart = oView.byId("sap_Responsive_Page_0-content-sap_m_ScrollContainer-1607023375094-content-sap_chart_StackedColumnChart-1607023397392");
			oChart.bindData(oBindingParameters['sap_Responsive_Page_0-content-sap_m_ScrollContainer-1607023375094-content-sap_chart_StackedColumnChart-1607023397392']);

			oChart = oView.byId("sap_Responsive_Page_0-content-sap_m_ScrollContainer-1606439795513-content-sap_chart_ColumnChart-1606439821252");
			oChart.bindData(oBindingParameters['sap_Responsive_Page_0-content-sap_m_ScrollContainer-1606439795513-content-sap_chart_ColumnChart-1606439821252']);

		}
	});
}, /* bExport= */ true);
