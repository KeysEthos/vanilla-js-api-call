<!--SVMETA
{
	"requireBundles" : [
		"plugins_listings_shared",
		"plugins_common_custom_layout",
		"plugins_common_custom_map"
	],
	"partials" : [
		{ "plugin" : "common", "name" : "custom_info_window" },
		{ "plugin" : "listings", "name" : "custom_listing_list_filter" },
		{ "plugin" : "listings", "name" : "custom_listing_list_alphasort" },
		{ "plugin" : "listings", "name" : "custom_listing_list_pager" },
		{ "plugin" : "listings", "name" : "custom_listing_list_item" },
		{ "plugin" : "common", "name" : "custom_map_handle" }
	]
}
-->

<div id="audioModal" class="reveal-modal" data-reveal>
	<div data-audio-fill></div>
	<a class="close-reveal-modal">&#215;</a>
</div>
<div class="listings shared-list" id="listings_{{guid}}">
	<script type="text/template" data-sv-mapTemplate>{{~partial("custom_map_handle")}}</script>
 	<script type="text/template" data-sv-listingListItem>{{~partial("custom_listing_list_item")}}</script>
	<script type="text/template" data-sv-alphaSortTemplate>{{~partial("custom_listing_list_alphasort")}}</script>
	<script type="text/template" data-sv-pagerTemplate>{{~partial("custom_listing_list_pager")}}</script>
	<script type="text/template" data-sv-filterTemplate>{{~partial("custom_listing_list_filter")}}</script>
	<script type="text/template" data-sv-infoWindowTemplate>{{~partial("custom_info_window")}}</script>

	<script type="text/template" data-sv-mainTemplate>
		{{$}}
			{{>filter}}
				<div class="listingContainer">
				<div class="clear"></div>

				{{:data}}
					{{#data}}
						{{>listingListItem}}
					{{/data}}

				<div class="listingContainerFoot{{:*inRange}} geo-on{{/inRange}}">
					<div class="nav-pager">{{>pager}}</div>
				</div>
				{{/data}}

				{{!data}}
					<h3 class="no-results">There are no listings that match your query.</h3>
				{{/data}}
				</div>
		{{/}}
	</script>
</div>

<script>
	require([
			"jquery",
			"plugins_listings/main",
			"sv_goatee!plugins=stringLib",
			"qs",
			"geodist",
			"sv_stringLib",
			"sv_crmLib",
			"sv_arrayLib",
			"plugins_listings_custom_seotracker",
			"plugins_listings_custom_map",
			"plugins_listings_custom_listings_lib",
			"domReady!"
	], function(
		$,
		Listings,
		goatee,
		qs,
		geodist,
		stringLib,
		sv_crmLib,
		arrayLib,
		seotracker,
		mapObj,
		lib
	) {

		var root = $("#listings_{{guid}}");

		var listingContainerClass = "listingContainer";
		var listingFilterContainerClass = "listingFilterContainer";
		var listingPagerContainerClass = "listingPagerContainer";
		var infoWindowTmpl = root.find("[data-sv-infoWindowTemplate]").html();
		var mainTemplate = root.find("[data-sv-mainTemplate]").html();
		var pagerTemplate = root.find("[data-sv-pagerTemplate]").html();
		var mapTemplate = root.find("[data-sv-mapTemplate]").html();
		var alphaSortTemplate = root.find("[data-sv-alphaSortTemplate]").html();
		var filterTemplate = root.find("[data-sv-filterTemplate]").html();
		var listingListItem = root.find("[data-sv-listingListItem]").html();
		var widget = {{widget}};
		var activeSubCats = {{subcats}};
		var activeRegions = {{regions}};
		var activeAmenities = {{amenities}};
		var limit = 10;
		var coords = {};
		var token = "{{token}}";
		var urlQs;
		var listings;
		var maxRangeMiles = {{maxRangeMiles}};
		var clientLat = {{clientLat}};
		var clientLon = {{clientLon}};
		var distanceUnit = "miles"  /* miles or mi, yards, feet, kilometers or km, meters */;
		var distanceFromClient;
		var inRange;
		var dtnargs = {{dtn}};
		var pxFromTopToScroll = 300;
		var elementToScrollTo = 'div#listingSearch';
		var scrollSpeed = 175;
		
		widget.showSearchBox = (widget.showSearchBox !== undefined) ? widget.showSearchBox : true;
		
		var filter = {
			"categories.catid" : widget.listingcats,
			"categories.subcatid" : { "$in" : widget.listingsubcats },
			"regionid" : { "$in" : widget.region_array }
		};

		var options = { 
			"limit" : limit,
			"skip" : 0
		};
		var globalFilter = {
			filter : filter
		};

		var renderFilter = function() {
			var tempFilter = '<div class="' + listingFilterContainerClass + '"></div>';

			if (root.find("." + listingContainerClass).length === 0) {
				var html = goatee.fill(mainTemplate, {}, { filter : tempFilter }, {});
				root.html(html);
			}
			
			var filterHTML = goatee.fill(
				filterTemplate,
				{ widget : widget, subcats : arrayLib.sortBy(activeSubCats, "sortorder", "numeric", "asc"), regions : arrayLib.sortBy(activeRegions, "sortorder", "numeric", "asc"), amenities : arrayLib.sortBy(activeAmenities, "sortorder", "numeric", "asc"), inRange : inRange },
				{ alphaSort: alphaSortTemplate, map : mapTemplate, pager: pagerTemplate },
				globalFilter
			);
			root.find("." + listingFilterContainerClass).replaceWith(filterHTML);

			handleAmenitiesContainer();
		}

		var cloneOptions = function(obj) {
			for (var key in options) {
				obj[key] = options[key];
			}
			return obj;
		}

		var renderTemplate = function(filter, options, cb) {
			var data, pager;
			options.skip = parseInt(options.skip);
			options.limit = parseInt(options.limit);
			options.skip = options.skip > 0 ? options.skip - 1 : options.skip;
			options.fields = {
				address1 : 1,
				description: 1, 
				altphone : 1,
				categories : 1,
				city : 1,
				crmtracking : 1,
				detailURL : 1,
				dtn : 1,
				isDTN : 1,
				latitude : 1,
				loc: 1,
				longitude : 1,
				media : 1,
				phone : 1,
				primary_image : 1,
				primary_image_url : 1,
				rankid : 1,
				rankorder : 1,
				recid : 1,
				regionid : 1,
				state : 1,
				title : 1,
				zip : 1
			}

			listings.getData({ filter : filter, options : options, dtnargs : dtnargs }, function(err, args) {
				//fill templates with data
				data = args.data;
				pager = args.pager;

				var limit = 130;
				$.each(data, function(i, val) {
					if (val.description !== undefined && val.description !== null) {
						val.description = stringLib.stripHtml(val.description);
						val.description = stringLib.substringOnWord(val.description, limit) + "&hellip;";
					}

					// IMPLEMENTS CRM TRACKING FOR WEBURL
					val.weburl = sv_crmLib.getTrackUrl(val.crmtracking.core_listing_click, val.weburl);

					//validate social links
					if (val.social !== undefined && val.social !== null) {
						$.each( val.social, function( key, val ) {
							if (this.smserviceid == 4) {
								val.value = lib.getValidSocialUrl({ url : val.value , urlType : "facebook" });
							}
							else if (this.smserviceid == 1) {
								val.value = lib.getValidSocialUrl({ url : val.value , urlType : "twitter" });
							}
						});
					}
				});

				var html = goatee.fill(mainTemplate, { skip : options.skip, data : data }, { alphaSort: alphaSortTemplate, pager : pagerTemplate, listingListItem : listingListItem }, { inRange : inRange });
				
				root.find("." + listingContainerClass).replaceWith(html);

				if (pager.hasNextPage) {
					var nextOptions = {};
					nextOptions = cloneOptions(nextOptions);
					var lastOptions = {};
					lastOptions = cloneOptions(lastOptions);
					nextOptions.skip = pager.nextPageStartRow;
					lastOptions.skip = pager.lastPageStartRow;
					pager.nextURL = "?" + qs.stringify({ filter : filter }) + "&" + qs.stringify({ options : nextOptions });
					pager.lastURL = "?" + qs.stringify({ filter : filter }) + "&" + qs.stringify({ options : lastOptions });
				}

				if (pager.hasPreviousPage) {
					var prevOptions = {};
					prevOptions = cloneOptions(prevOptions);
					var firstOptions = {};
					firstOptions = cloneOptions(firstOptions);
					prevOptions.skip = pager.previousPageStartRow;
					firstOptions.skip = 1;
					pager.prevURL = "?" + qs.stringify({ filter : filter }) + "&" + qs.stringify({ options : prevOptions });
					pager.firstURL = "?" + qs.stringify({ filter : filter }) + "&" + qs.stringify({ options : lastOptions });
				}

				var pageHtml = goatee.fill(pagerTemplate, { pager : pager });
				root.find("." + listingPagerContainerClass).replaceWith(pageHtml);

				// begin: Google Maps logic
				var placemarks = [];
				$.each(data, function(i,v){
					if (v.latitude && v.longitude) {
						placemarks.push({
							id : "listing_"+v.recid,
							marker : {
								position : [v.latitude, v.longitude]
							},
							infoWindow : {
								content : goatee.fill(infoWindowTmpl, v),
								maxWidth : 300
							}
						});
					}
				});
				
				mapObj.setState({
					placemarksAdded : false,
					placemarks : placemarks
				});
				// end: Google Maps logic

				if (filter.alpha && filter.alpha["$gte"] && filter.alpha["$lte"]) {
					root.find("[data-sv-alpha]").removeClass("selected");
					root.find("[data-sv-alpha]").each( function() {
						var self = $(this);
						if (self.attr("data-alphastart") === filter.alpha["$gte"] && self.attr("data-alphaend") === filter.alpha["$lte"]) {
							self.addClass("selected");
						}
					});
				}

				addSEMTracking(data);
				if (dtnargs.auid !== undefined) {
					dtn.listingTracking(dtnargs.auid, root);
				}
				
				cb(null);
			});
		}

		if (window.location.search.length && window.location.search.match(/\?filter/)) {
			urlQs = qs.parse(window.location.search.replace(/\?/, ""));
			filter = urlQs.filter;
			options = urlQs.options;
		} 

		if (history.replaceState !== undefined) {
			history.replaceState({ filter : filter, options : options }, "", window.location.search);
		}
		
		if (urlQs !== undefined) {
			globalFilter = urlQs;
		}

		//load listings initially, in case a user doesn't see the geo-location notification
		listings = new Listings({ 
				{{:data}}{{>pager}}{{/data}}
			coords : coords, 
			token : token,
			clientLat : clientLat,
			clientLon : clientLon
		});

		//renderFilter();

		// if geolocation is not needed, uncomment the two lines below and delete the renderTemplate block after that
		// filter.sortby = "rankorder=1&sortcompany=1";
		// renderTemplate(filter, options, function() {});

		renderTemplate(filter, options, function() {
			if (options.custom !== undefined && options.custom.distance !== undefined && options.custom.distance.length === 2) {
				coords.latitude = options.custom.distance[1];
				coords.longitude = options.custom.distance[0];
				inRange = new geodist({ start : { lat : coords.latitude, lon : coords.longitude }, end : { lat : clientLat, lon : clientLon } }).inRange({ limit : maxRangeMiles, unit : distanceUnit });

				if (filter.sortby !== "rankorder=1&sortcompany=1" && inRange) {
					// we want this to pass through to renderFilter()
					filter.sortby = "distance";
				}
				renderFilter();

				if (filter.sortby === "distance") {
					listings = new Listings({ 
						coords : coords, 
						token : token, 
						clientLat : clientLat,
						clientLon : clientLon
					});
				}
				renderTemplate(filter, options, function() {});
			} else if ("geolocation" in navigator) {

				// render page before "distance" filtering
				renderFilter();
				renderTemplate(filter, options, function() {});

				navigator.geolocation.getCurrentPosition(function(position) {
					coords.latitude = position.coords.latitude;
					coords.longitude = position.coords.longitude;
					inRange = new geodist({ start : { lat : coords.latitude, lon : coords.longitude }, end : { lat : clientLat, lon : clientLon } }).inRange({ limit : maxRangeMiles, unit : distanceUnit });

					if (filter.sortby !== "rankorder=1&sortcompany=1" && inRange) {
						// we want this to pass through to renderFilter()
						filter.sortby = "distance";
					}
					else {
						filter.sortby = "rankorder=1&sortcompany=1";
					}

					renderFilter();
					if (filter.sortby == "distance") {
						listings = new Listings({ 
							coords : coords, 
							token : token, 
							clientLat : clientLat,
							clientLon : clientLon
						});
					}
					renderTemplate(filter, options, function() {});
				},
				function(error) {
					// do nothing since we already rendered
				});
			}

		});

		root.on("click", ".listingPager", function() {
			var self = $(this);
			var URL = self.attr("href");
			if (self.attr("data-row") !== undefined && self.attr("data-row").length) {
				skip = self.attr("data-row");
				options.limit = limit;
				options.skip = parseInt(skip);
				renderTemplate(filter, options, function() {
					if (history.pushState !== undefined) {
						history.pushState({ filter : filter, options : options }, "", "?" + qs.stringify({ filter : filter}) + "&" + qs.stringify({ options : options }));
					}
				});
			}

			$("html, body").animate({ scrollTop: $(elementToScrollTo).offset().top + pxFromTopToScroll }, scrollSpeed);

			return false;
		});
		
		root.on("submit", "." + listingFilterContainerClass + " form", function() {
			filter = qs.parse($(this).serialize());
			options.limit = limit;
			options.skip = 0;
			renderTemplate(filter, options, function() {
				if (history.pushState !== undefined) {
					history.pushState({ filter : filter, options : options }, "", "?" + qs.stringify({ filter : filter}) + "&" + qs.stringify({ options : options }));
				}
			});
			return false;
		});

		root.on("click", "[data-sv-alpha]", function() {
			var self = $(this);
			filter.alpha = {};
			options.skip = 0;
			if (self.attr("data-alphastart")) {
				filter["alpha"]["$gte"] = self.attr("data-alphastart");
			} else {
				filter["alpha"]["$gte"] = "";
			}
			if (self.attr("data-alphaend")) {
				filter["alpha"]["$lte"] = self.attr("data-alphaend");
			} else {
				filter["alpha"]["$lte"] = "";
			}
			renderTemplate(filter, options, function() {
				if (history.pushState !== undefined) {
					history.pushState({ filter : filter, options : options }, "", "?" + qs.stringify({ filter : filter}) + "&" + qs.stringify({ options : options }));
				}
				root.find("[data-sv-alpha]").removeClass("selected");
				self.addClass("selected");
			});

			$("html, body").animate({ scrollTop: $(elementToScrollTo).offset().top + pxFromTopToScroll }, scrollSpeed);

			return false;
		});
		
		// since we're using links isntead of a drop down. comment this out
		/*root.on("change", "select[name='sortby']", function() {
			root.find("." + listingFilterContainerClass + " form").trigger("submit");
		});*/

		root.on("click", "a[data-sv-sortByLink]", function(e) {
			e.preventDefault();
			root.find('a[data-sv-sortByLink]').removeClass('selected');
			root.find('input[name=sortby]').val($(this).data('sortType'))
			root.find("." + listingFilterContainerClass + " form").trigger("submit");
			$(this).addClass('selected');
		});
			

		root.on("click", "#label_amenities", function() {
			$(this).toggleClass("close");
			root.find(".amenities").toggle();
		});

		// begin: Google Maps logic
		mapObj.init({
			node : root,
			scrollSpeed: scrollSpeed,
			map : { markerIcon : '/includes/public/assets/shared/map_point.png' }
		});
		mapObj.initListInterface();
		mapObj.renderMap();
		// end: Google Maps logic

		if (window.onpopstate !== undefined) {
			window.onpopstate = function(event) { 
				if (event.state !== null && event.state.filter !== undefined && event.state.options !== undefined) {
					filter = event.state.filter;
					options = event.state.options;
					renderTemplate(filter, options, function() {});
					renderFilter();
				}
			}
		}

		root.on("click", "[data-audio-source]", function() {
			var source = $(this).data("audio-source");
			var format = source.substr(source.length - 3);
			var html = '<audio controls><source data-audio-fill src="' + source + '" type="audio/' + format + '">Your browser does not support the audio tag.</audio>';
			$("[data-audio-fill]").html(html);
		});


		var addSEMTracking = function(data) {
			var seocat = data['isDTN'] !== undefined && data['isDTN'] == true ? "Listings | DTN" : "Listings";
			var detailAction = "Link to Detail";

			$('[data-seo-listing]').each(function() {
				var title = $(this).data("seoTitle");

				$(this).find("[data-seo-mapit]").attr("onclick", seotracker.addEvent({ wrap: false, category: seocat, action: "Map It", label: title }));
				$(this).find("[data-seo-detail]").attr("onclick", seotracker.addEvent({ wrap: false, category: seocat, action: detailAction, label: title }));
				$(this).find("[data-seo-data-seo-add-to-trip]").attr("onclick", seotracker.addEvent({ wrap: false, category: seocat, action: 'Add to Trip', label: title }));
				$(this).find("[data-seo-detail-image]").attr("onclick", seotracker.addEvent({ wrap: false, category: seocat, action: detailAction, label: title, vars: [{dimension1: "Image"}] }));
				$(this).find("[data-seo-detail-audio]").attr("onclick", seotracker.addEvent({ wrap: false, category: seocat, action: detailAction, label: title, vars: [{dimension1: "Audio"}] }));	
			});
		};

		var handleAmenitiesContainer = function() {
			/* place the amenities field container directly underneath the amenities for mobile view so
			   don't need to do any wierd hacky CSS achieve a similar affect */
			if ($(window).width() <= 640 /* your mobile break point */) {
				if ($('[data-sv-amenitiesContainer] [data-sv-amenities]').length && $('[data-sv-amenitiesMobileContainer]').length) {
					$('[data-sv-amenitiesMobileContainer]').append($('[data-sv-amenities]').detach());
				}
			}
			else {
				if ($('[data-sv-amenitiesMobileContainer] [data-sv-amenities]').length && $('[data-sv-amenitiesContainer]').length) {
					$('[data-sv-amenitiesContainer]').append($('[data-sv-amenities]').detach());
				}
			}
		};
		$(window).resize(function() {
			handleAmenitiesContainer();
		});



	});
</script>