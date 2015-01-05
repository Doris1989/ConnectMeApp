var app = angular.module('obo', ['ngSanitize']);

function svc_search_v2_articlesearch(data) {
    console.log(data);
}
app.controller('mainController', ['$scope', '$http', '$sce', '$rootScope', function($scope, $http, $sce, $rootScope) {
    $rootScope.user_id = $.cookie('user_id');

    if ($rootScope.user_id === undefined) {
        console.log("Redirecting to login."); 
        window.location = '/login/';
    } else {
        console.log("User with id " + $rootScope.user_id + " found. Recovering session.");
        $http.get('/api/users/' + $rootScope.user_id)
        .success(function(data) {
            $rootScope.user = data;
            $scope.getEventsOfUser();
        })
        .error(function(data) {
            console.log("Failed to find info of user...");
            //window.location = '/login/';
        });
    }
	
	$('a.eventLink').click(function() {
		$(this).attr('target', '_blank');
	}); 

    console.log("Recovered login of user " + $rootScope.user_id);

	$('#main-calendar').fullCalendar({
		eventClick: function(calEvent, jsEvent, view) {
			$scope.selected_event = calEvent;
			$scope.displayEventOptions();
			console.log("selected_event changed", $scope.selected_event)
            return false;
		}
	});
	
    $scope.query = null;
    $scope.results = [];

    $scope.search = function() {
        if ($scope.query !== null) {
            $scope.getEvents($scope.query);
        }
    };
	
	$scope.getEvents = function(query) {
		$http.get('/api/events/' + query + '/')
            .success(function(data) {
                
                $scope.all_events = data;
            })
            .error(function(data) {
			});
	};

    $scope.toShortDateString = function(date_str) {
		return moment(date_str / 1000, 'X').format("MMM D");
    }

    $scope.getEventsOfUser = function() {
        $http.get('/api/calendar/user/' + $rootScope.user_id)
            .success(function(data) {
                $rootScope.user.calendar_id = data._id.$oid;
                $http.get('/api/calendar/' + $rootScope.user.calendar_id + '/events/')
                .success(function(data) {
                    data.forEach($scope.showEventOnCalendarInit);
                })
                .error(function(data) {
                });
            })
            .error(function(data) {
            });
    }

    $scope.getAllEvents = function() {
        $http.get('/api/events/')
        .success(function(data) {
            $scope.all_events = data;
            $scope.all_events.forEach(function(event) {
                event.date = moment(event.date.$date).add('days', 1);
            });
        })
        .error(function() {
        });
    }
    $scope.getAllEvents();

    $scope.addEventToCalendar = function(event) {
		var events = $('#main-calendar').fullCalendar('clientEvents');
		
		console.dir(events);
		console.log(event._id.$oid);
		
		for(i = 0; i < events.length; i++) {
			if (events[i]._id === event._id.$oid) {
				return;
			}
		}
		
        $http.post('/api/calendar/addEvent/', {calendar_id:$rootScope.user.calendar_id, event_id:event._id.$oid})
            .success(function(data) {
                $scope.showEventOnCalendar(event);
            })
            .error(function() {
            });
    }

   $scope.logout = function() {
       $.removeCookie('user_id', {path:'/'});
       window.location = '/';
   }

   $scope.showEventOnCalendar = function(event) {
        if (event == null) {
			return;
        }
				
        $('#main-calendar').fullCalendar('renderEvent', {
            'title': event.name,
            'allDay': true,
            'start': event.date,
            'url': event.url,
			'id': event._id.$oid
        }, true);
        $('#main-calendar').find('a.fc-event').attr('target', '_blank');

    };
	
	$scope.showEventOnCalendarInit = function(event) {
        if (event == null) {
			return;
        }
		
        $('#main-calendar').fullCalendar('renderEvent', {
            'title': event.name,
            'allDay': true,
            'start': moment(event.date.$date).add('days', 1),
            'url': event.url,
			'id': event._id.$oid
        }, true);
        $('#main-calendar').find('a.fc-event').attr('target', '_blank');

    };

	$scope.getFriends = function() {
		var friends = [];
		for(i = 0; i < $scope.user.friends.length; i++) {
			console.dir($scope.user.friends);

			$http.get('/api/users/' + $scope.user.friends[i].id)
				.success(function(data) {
					console.log(data);
					friends.push(data);
				})
				.error(function(data) {
					console.log(data);
				});
		}
		$scope.friends = friends;
		$scope.displayModal();
	};

	$scope.displayEventOptions = function() {
		console.log("Displaying event options");

        console.log("Selected Event", $scope.selected_event)

		$scope.getFriends();

	};
	
	$scope.displayModal = function() {
		$("#eventDetails").modal({
			overlayCss: {
				backgroundColor: '#000'
			},
			containerCss: {
				backgroundColor: '#fff'
			}, 
			overlayClose:true,
			onOpen: function (dialog) {
				dialog.overlay.fadeIn('slow', function () {
					dialog.data.hide();
					dialog.container.fadeIn('slow', function () {
						dialog.data.slideDown('slow');
					});
				});
			},
			onClose: function (dialog) {
				dialog.data.fadeOut('slow', function () {
					dialog.container.hide('slow', function () {
						dialog.overlay.fadeOut('slow', function() {
							//document.getElementById('noFriends').display='none';
							$.modal.close();
						});
					});
				});
			}
		});
		//if ($scope.friends.length == 0) {
		//	document.getElementById('noFriends').style.display='block';
		//}
		return false;
	}

	$scope.deleteEvent = function() {
		$scope.deleteEventFromCalendar($scope.selected_event);
		$.modal.close();
	};

	$scope.deleteEventFromCalendar = function(calEvent) {
		console.log("Deleting event " + calEvent.id);
		$http.post('/api/calendar/removeEvent/', {cal_id:$rootScope.user.calendar_id, event_id:calEvent.id})
            .success(function(data) {
                $('#main-calendar').fullCalendar('removeEvents', calEvent.id);
            })
            .error(function(data) {
				console.log(data);
            });
	};
	
	$scope.shareEvent = function(friend_id) {
		var calEvent = $scope.selected_event;
		console.log(calEvent.id);
		console.log($rootScope.user_id);
		console.log(friend_id);
		$http.post('/api/shareEvent/', {user_id:$rootScope.user_id, friend_id: friend_id,event_id:calEvent.id})
            .success(function(data) {
                alert("success");
            })
            .error(function(data) {
				console.log(data);
            });
	}
}]);
