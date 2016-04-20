var mongolayer = require("/sv/node_modules/npm/mongolayer/1/node_modules/mongolayer/");
var arrayLib = require("/sv/node_modules/sv/arrayLib/1/");
var urlLib = require("/sv/node_modules/sv/urlLib/1/");
var mongoLib = require("/sv/node_modules/sv/mongoLib/1/");
var miscLib = require("/sv/node_modules/sv/miscLib/1/");
var validator = require("/sv/node_modules/sv/validator/1/");

var getApi = function(args) {
	var site = args.site;
	var plugin = args.plugin;
	var settings = plugin._def.settings;
	var timezone = plugin._site.config.settings.timezone;
	var meetingroomUdfArray = mongoLib.getUdfDataArray({ name : "udfs" });
	var meetingroomUdfObject = mongoLib.getUdfDataObject({ name : "udfs_object" });
	meetingroomUdfArray.validation.name = "udfs";
	meetingroomUdfObject.validation.name = "udfs_object";
	var meetingfacilityAdditional = mongoLib.getAmenityDataArray({ name : "additional" });
	meetingfacilityAdditional.validation.name = "additional";
	var meetingfacilityAdditionalObject = mongoLib.getAmenityDataObject({ name : "additional_object" });
	meetingfacilityAdditionalObject.validation.name = "additional_object";
	
	var fields = [
		{ name : "updated", validation : { type : "date" }, required : true },
		{
			name : "social",
			validation : {
				type : "array",
				schema : {
					type : "object",
					schema : [
						{ name : "fieldname", type : "string" },
						{ name : "value", type : "string" },
						{ name : "smfieldid", type : "number" },
						{ name : "smserviceid", type : "number" }
					],
					deleteExtraKeys : true
				}
			}
		},
		{ name : "ares_siteid", validation : { type : "number" } },
		{ name : "taid", validation : { type : "number" } },
		{ name : "wctid", validation : { type : "number" } },
		{ name : "ares_endrange", validation : { type : "string" } },
		mongoLib.getGeoJsonMongolayerField({ name : "loc" }),
		{ name : "taoptin", validation : { type : "boolean" } },
		{ name : "address1", validation : { type : "string" } },
		{ name : "address2", validation : { type : "string" } },
		{ name : "address3", validation : { type : "string" } },
		{ name : "zip", validation : { type : "string" } },
		{ name : "contact_email", validation : { type : "string" } },
		{
			name : "media",
			validation : {
				type : "array",
				schema : {
					type : "object",
					schema : [
						{ name : "mediathumbfile", type : "string" },
						{ name : "mediaid", type : "number" },
						{ name : "mediafile", type : "string" },
						{ name : "mediathumburl", type : "string" },
						{ name : "mediaurl", type : "string" },
						{ name : "sortorder", type : "number" },
						{ name : "medianame", type : "string" },
						{ name : "mediadesc", type : "string" },
						{ name : "mediatype", type : "string" }
					],
					deleteExtraKeys : true
				}
			}
		},
		{ name : "primary_image_url", validation : { type : "string" } },
		{ name : "region", validation : { type : "string" } },
		{ name : "fax", validation : { type : "string" } },
		{ name : "listing_keywords", validation : { type : "string" } },
		{ name : "typeid", validation : { type : "number" } },
		{ name : "company", validation : { type : "string" } },
		mongoLib.getUdfDataArray({ name : "listingudfs" }),
		mongoLib.getUdfDataObject({ name : "listingudfs_object" }),
		mongoLib.getUdfDataArray({ name : "accountudfs" }),
		mongoLib.getUdfDataObject({ name : "accountudfs_object" }),
		{ name : "altphoneext", validation : { type : "string" } },
		{
			name : "dtn",
			validation : {
				type : "object",
				schema : [
					{ name : "edate", type : "date" },
					{ name : "description", type : "string" },
					{ name : "mediaid", type : "number" },
					{ name : "rank", type : "number" },
					{ name : "sdate", type : "date" },
					{ name : "showweb", type : "boolean" },
					{ name : "mobile", type : "boolean" },
					{
						name : "categories",
						type : "array",
						schema : {
							type : "object",
							schema : [
								{ name : "catid", type : "number" }
							],
							deleteExtraKeys : true
						}
					},
					{
						name : "subcategories",
						type : "array",
						schema : {
							type : "object",
							schema : [
								{ name : "subcatid", type : "number" }
							],
							deleteExtraKeys : true
						}
					}
				],
				deleteExtraKeys : true
			}
		},
		{ name : "aresid", validation : { type : "number" } },
		{ name : "altphone", validation : { type : "string" } },
		{ name : "tacatid", validation : { type : "number" } },
		{ name : "ares_startrange", validation : { type : "string" } },
		{ name : "description", validation : { type : "string" } },
		{ name : "fullname", validation : { type : "string" } },
		{ name : "city", validation : { type : "string" } },
		{ name : "account_keywords", validation : { type : "string" } },
		{ name : "acctid", validation : { type : "number" } },
		{ name : "parentid", validation : { type : "number" } },
		{ name : "sortcompany", validation : { type : "string" } },
		{ name : "typename", validation : { type : "string" } },
		{ name : "rankorder", validation : { type : "number" }, default : 999 },
		{ name : "state", validation : { type : "string" } },
		{ name : "fname", validation : { type : "string" } },
		{ name : "lname", validation : { type : "string" } },
		{ name : "recid", validation : { type : "number" } },
		{ name : "weburl", validation : { type : "string" } },
		{ name : "status", validation : { type : "string" } },
		{ name : "phoneext", validation : { type : "string" } },
		{
			name : "meetingfacility",
			validation : {
				type : "object",
				schema : [
					{ name : "exhibitspace", type : "number" },
					{ name : "description", type : "string" },
					{ name : "exhibits", type : "number" },
					{ name : "ceiling", type : "number" },
					{ name : "imageurl", type : "string" },
					{ name : "largestroom", type : "number" },
					{ name : "tollfree", type : "string" },
					{ name : "totalsqft", type : "number" },
					{ name : "reception", type : "number" },
					{ name : "imagefile", type : "string" },
					{ name : "spacenotes", type : "string" },
					{ name : "theatre", type : "number" },
					meetingfacilityAdditional.validation,
					meetingfacilityAdditionalObject.validation,
					{ name : "bigfile", type : "string" },
					{ name : "villas", type : "number" },
					{ name : "banquet", type : "number" },
					{ name : "numrooms", type : "number" },
					{ name : "booths", type : "number" },
					{ name : "bigurl", type : "string" },
					{ name : "suites", type : "number" },
					{ name : "classroom", type : "number" },
					{ name : "sleepingrooms", type : "number" }
				],
				deleteExtraKeys : true
			}
		},
		{ name : "phone", validation : { type : "string" } },
		{ name : "addressid", validation : { type : "number" } },
		mongoLib.getAmenityDataArray({ name : "amenities_array" }),
		mongoLib.getAmenityDataObject({ name : "amenities" }),
		{ name : "email", validation : { type : "string" } },
		{ name : "rankname", validation : { type : "string" } },
		{ name : "country", validation : { type : "string" } },
		{ name : "tollfree", validation : { type : "string" } },
		{ name : "faxext", validation : { type : "string" } },
		{ name : "rankid", validation : { type : "number" } },
		{
			name : "meetingrooms",
			validation : {
				type : "array",
				schema : {
					type : "object",
					schema : [
						{ name : "height", type : "string" },
						{ name : "listeningdevices", type : "string" },
						{ name : "reception", type : "string" },
						{ name : "theater", type : "string" },
						{ name : "width", type : "string" },
						{ name : "roomname", type : "string" },
						{ name : "roomid", type : "string" },
						{ name : "banquet", type : "string" },
						{ name : "booths", type : "string" },
						{ name : "classroom", type : "string" },
						{ name : "length", type : "string" },
						{ name : "sqft", type : "string" },
						{ name : "amphitheater", type : "string" },
						meetingroomUdfArray.validation,
						meetingroomUdfObject.validation
					],
					deleteExtraKeys : true
				}
			}
		},
		{ name : "contactid", validation : { type : "number" } },
		{ name : "addresstype", validation : { type : "string" } },
		{ name : "statusid", validation : { type : "number" } },
		{
			name : "categories",
			validation : {
				type : "array",
				schema : {
					type : "object",
					schema : [
						{ name : "primary", type : "boolean" },
						{ name : "subcatid", type : "number" },
						{ name : "subcatname", type : "string" },
						{ name : "catname", type : "string" },
						{ name : "catid", type : "number" }
					],
					deleteExtraKeys : true
				}
			}
		},
		{ name : "primary_category", validation : { type : "object" } },
		{ name : "primarycatid", validation : { type : "number" } },
		{ name : "primarysubcatid", validation : { type : "number" } },
		{ name : "regionid", validation : { type : "number" } },
		{ name : "title", validation : { type : "string" }, required : true },
		{ name : "cms_title", validation : { type : "string" } },
		{ name : "cms_title_sort", validation : { type : "string" } },
		{ name : "contacttitle", validation : { type : "string" } },
		{ name : "alpha", validation : { type : "string" } },
		{ name : "crmtracking", validation : { type : "object" } },
		{
			name : "tripadvisor",
			validation : {
				type : "object",
				schema: [
					{ name : "tatype", type : "string" },
					{ name : "taurl", type : "string" },
					{ name : "rating", type : "number" },
					{ name : "ratingimage", type : "string" },
					{ name : "rankstring", type : "string" },
					{ name : "reviews", type : "number" },
					{ name : "pricelevel", type : "string" }
				],
				deleteExtraKeys : true
			}
		},
		{ name : "tripadvisor_checksum", validation : { type : "string" } },
		{ name : "primary_site", validation : { type : "string" }, required : true },
		{ name : "sites", validation : { type : "array", schema : { type : "string" } }, required : true },
		{ name : "locale_code", validation : { type: "string" } },
		{ 
			name : "locale_related",
			validation : {
				type : "array",
				schema : {
					type : "object",
					schema : [
						{ name : "recid", type : "number" },
						{ name : "locale_code", type : "string" }
					]
				}
			}
		},
		{ name : "filter_tags", validation : { type : "array", schema : { type : "string" } } }, // used as index aggregator for array values
		{ name : "_absolute_urls", persist : false }
	];
	
	if (settings.customDataSchema !== undefined) {
		fields.push({
			name : "custom",
			validation : {
				type : "object", 
				schema : settings.customDataSchema, 
				deleteExtraKeys : true
			}
		});
	}
	
	var model = new mongolayer.Model({
		collection : args.collection,
		deleteExtraKeys : true,
		fields : fields,
		relationships : [
			// TODO: recid and recId should be normalized to one or the other!
			{ name : "events", type : "multiple", modelName : "plugins_events_events", rightKey : "recId", rightKeyValidation : { type : "number" }},
			{ name : "offers", type : "multiple", modelName : "plugins_offers_offers", rightKey : "recid", rightKeyValidation : { type : "number" }},
			{ name :  "locale_items", type : "multiple", modelName : "plugins_listings_listings", rightKey : "recid", rightKeyValidation : { type : "number" }}
		],
		virtuals : [
			{
					name : "absolute_urls",
					enumerable : false,
					get : function() {
						if (this.sites === undefined) {
							return;
						}
						
						if (this._absolute_urls !== undefined) {
							return this._absolute_urls;
						}
						
						var url = this.url;
						var absolute_urls = {};
						this.sites.forEach(function(val) {
							if (site.siteConfigs[val] === undefined) { return; } // exclude entries which we don't have sites for
							absolute_urls[val] = site.siteConfigs[val].urlNoSlash + url;
						});
						
						this._absolute_urls = absolute_urls;
						return this.absolute_urls;
					}
			},
			{
				name : "detailURL",
				get : function() {
					if (this.title === undefined || this.recid === undefined) { return; }
					
					return plugin._detailPath + urlLib.slugify(this.title) + "/" + this.recid + "/";
				},
				enumerable : true
			},
			{
				name : "url",
				get : function() {
					return this.detailURL;
				},
				enumerable : true
			},
			{
				name : "absolute_primary_url",
				get : function() {
					return miscLib.varLookup(this, ["absolute_urls", this.primary_site]);
				},
				enumerable : true
			},
			{
				name : "primary_image",
				get : function() {
					if (this.primary_image_url === undefined) { return; }
					return { resource: args.site.cloudinary.createResource({ imageUrl : this.primary_image_url }) };
				},
				enumerable : false
			},
			{
				name : "isListing",
				get : function() {
					return true;
				},
				enumerable : true
			},
			{
				name : "longitude",
				enumerable : true,
				get : function() {
					return (this.loc === undefined) ? undefined : this.loc.coordinates[0];
				}
			},
			{
				name : "latitude",
				enumerable : true,
				get : function() {
					return (this.loc === undefined) ? undefined : this.loc.coordinates[1];
				}
			},
			{
				name : "hasTripAdvisor",
				enumerable : true,
				get : function() {
					// ensures that all variables are in order in order for tripadvisor to be enabled on this listing
					return (
						plugin._def.settings.tripadvisor !== undefined
						&& (
							// only version 1 requires tacatid
							(plugin._def.settings.tripadvisor.version === 1 && this.tacatid !== undefined)
							||
							(plugin._def.settings.tripadvisor.version === 2)
						)
						&& this.taid !== undefined
						&& this.taoptin === true
					);
				}
			},
			{
				// gets the yelpid from the social media tab
				name : "yelpid",
				enumerable : true,
				get : function() {
					if (this.social === undefined) { return undefined; }

					var yelpid;

					this.social.some(function(val, i) {
						if (val.smserviceid === 5 && val.value !== undefined) {
							yelpid = val.value;
							return true;
						}
					});

					return yelpid;
				}
			},
			{
				name : "hasYelp",
				enumerable : true,
				get : function() {
					// TripAdvisor supercedes yelp so if TA is on, then yelp is off
					return (
						this.hasTripAdvisor === false
						&& plugin._def.settings.yelp !== undefined
						&& (
							plugin._def.settings.yelp.version === 1 || plugin._def.settings.yelp.version === 2
						)
						&& this.yelpid !== undefined
					);
				}
			}
		],
		hooks : [
			{
				// simplifies the creation of filter_tags queries using object syntax rather than string concatenation
				name : "filterTags",
				type : "beforeFilter",
				required : true,
				handler : function(args, cb) {
					if (args.filter.filter_tags_simple === undefined || args.filter.filter_tags !== undefined) {
						return cb(null, args);
					}
					
					var myArgs = args.filter.filter_tags_simple;
					delete args.filter.filter_tags_simple;
					
					var valid = validator.validate(myArgs, {
						type : "object",
						schema : [
							{
								name : "items",
								type : "array",
								schema : {
									type : "object",
									schema : [
										{ name : "site", type : "string" },
										{ name : "catid", type : "number" },
										{ name : "subcatid", type : "number" }
									],
									allowExtraKeys : false
								},
								required : true
							},
							{ name : "type", type : "string", default : "$in" }
						],
						allowExtraKeys : false
					});
					
					if (valid.err) { return cb(valid.err) }
					
					var tags = myArgs.items.map(function(val, i) {
						var priority = 0;
						var temp = [];
						if (val.site !== undefined) { priority += 1; temp.push("site_" + val.site) }
						if (val.catid !== undefined) { priority += 2; temp.push("catid_" + val.catid) }
						if (val.subcatid !== undefined) { priority += 3; temp.push("subcatid_" + val.subcatid) }
						
						return { tag : temp.join("_"), priority : priority };
					}).filter(function(val) {
						return val.priority > 0;
					});
					
					var tags = arrayLib.sortBy(tags, "priority", "numeric", "desc");
					
					args.filter.filter_tags = {}
					args.filter.filter_tags[myArgs.type] = tags.map(function(val) { return val.tag });
					
					cb(null, args);
				}
			},
			{
				name : "sort",
				type : "beforeFind",
				handler : function(args, cb) {
					if (args.options.custom !== undefined && args.options.custom.distance !== undefined) {
						args.filter.loc = {
							$nearSphere : {
								$geometry : {
									type : "Point",
									coordinates : [Number(args.options.custom.distance[0]), Number(args.options.custom.distance[1])]
								}
							}
						};
					}
					cb(null, args);
				}
			},
			{
				name : "dtn",
				type : "afterFind",
				handler : function(args, cb) {
					// to be used with _getDTNListings
					// assumes that every item in args.docs has dtn enabled and is within publish dates
					
					args.docs.forEach(function(val) {
						val.isDTN = true;
						if (val.dtn.description !== undefined) { val.description = val.dtn.description; }
						if (val.media !== undefined) {
							val.media.some(function(media) {
								if (media.mediaid === val.dtn.mediaid) {
									val.primary_image_url = media.mediaurl;
									return true;
								}
							});
						}
						if (val.dtn.mediaid !== undefined) { val.dtnmedia = val.dtn.mediaid; }
					});
					
					cb(null, args);
				}
			},
			{
				name : "foldAmenityTree",
				type : "afterFind",
				handler : function(args, cb) {
					plugin.apis.listingmeta.find({}, { fields : { amenities : 1 } }, function(err, res) {
						if (res.length > 0) {
							var amenities = res[0].amenities;
							args.docs.forEach(function(val, i) {
								val.amenityTree = [];
								for (var key in val.amenities) {
									amenities.forEach(function(val2, i) {
										val2.groups.forEach(function(val3, i) {
											if (val3.fields !== undefined) {
												val3.fields.forEach(function(val4, i) {
													val4.doc;
													if (key === val4.tabshortname + "_" + val4.shortname && val.amenities[key].fieldid === val4.fieldid && ((val.amenities[key].valuearray !== undefined && val.amenities[key].valuearray.length > 0) || (val.amenities[key].value !== undefined && val.amenities[key].value !== 'false' && val.amenities[key].value !== "0"))) {
														val4.doc = val.amenities[key];
													}
												});
											}
										});
										if (val2.amenitytabid === val.amenities[key].amenitytabid && val.amenityTree.indexOf(val2) === -1) {
											val.amenityTree.push(val2);
										}
									});
								}
								val.amenityTree = arrayLib.sortBy(val.amenityTree, "sortorder", "numeric", "asc");
								/*
									Clean up amenityTree.
								*/
								for (var j = val.amenityTree.length; j--;) {
									var tabs = val.amenityTree[j];
									for (var k = tabs.groups.length; k--;) {
										if (tabs.groups[k].fields !== undefined && tabs.groups[k].fields.length === 0) {
											tabs.groups.splice(k, 1);
										} else {
											tabs.groups[k].hasDoc = [];
											if (tabs.groups[k].fields !== undefined) {
												for (var l = tabs.groups[k].fields.length; l--;) {
													if (tabs.groups[k].fields[l].doc === undefined) {
														tabs.groups[k].fields.splice(l, 1);
													} else {
														tabs.groups[k].hasDoc.push(true);
													}
												}
											}
										}
										if (tabs.groups[k] !== undefined && tabs.groups[k].hasDoc.indexOf(true) === -1) {
											tabs.groups.splice(k, 1);
										}
									}
									if (tabs.groups.length === 0) {
										val.amenityTree.splice(j, 1);
									}
								}
							});
						}
						cb(null, args);
					});
				}
			}
		],
		indexes : [
			{
				keys : {
					loc : "2dsphere"
				}
			},
			{
				keys : { title : "text", description : "text" }
			},
			{
				keys : { recid : 1 },
				options : { unique : true }
			},
			{
				// used by link lookup, and ajax tagselect for specific listings, cms_title_sort helps with regex matching as well as sorting
				keys : { filter_tags : 1, cms_title_sort : 1 },
				options : { name : "cms_sort" }
			},
			{
				keys : { filter_tags : 1, rankorder : 1, sortcompany : 1 },
				options : { name : "listing_layout_alpha_sort" }
			}
		]
	});
	
	mongoLib.addSolrHooks({ site : site, model : model, solrType : "listings", idColumn : "recid" });

	return model;
}

module.exports = {
	getApi : getApi
}
