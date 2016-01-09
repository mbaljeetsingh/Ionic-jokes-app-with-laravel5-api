angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $rootScope) {


  // $rootScope.currentUser == null;

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  // $scope.loginData = {};

  // // Create the login modal that we will use later
  // $ionicModal.fromTemplateUrl('templates/login.html', {
  //   scope: $scope
  // }).then(function(modal) {
  //   $scope.modal = modal;
  // });

  // // Triggered in the login modal to close it
  // $scope.closeLogin = function() {
  //   $scope.modal.hide();
  // };

  // // Open the login modal
  // $scope.login = function() {
  //   $scope.modal.show();
  // };

  // // Perform the login action when the user submits the login form
  // $scope.doLogin = function() {
  //   console.log('Doing login', $scope.loginData);

  //   // Simulate a login delay. Remove this and replace with your login
  //   // code if using a login system
  //   $timeout(function() {
  //     $scope.closeLogin();
  //   }, 1000);
  // };
})

.controller('PlaylistsCtrl', function($scope, $http, $ionicModal) {
  // $scope.playlists = [
  //   { title: 'Reggae', id: 1 },
  //   { title: 'Chill', id: 2 },
  //   { title: 'Dubstep', id: 3 },
  //   { title: 'Indie', id: 4 },
  //   { title: 'Rap', id: 5 },
  //   { title: 'Cowbell', id: 6 }
  // ];
  // 
  $scope.playlists = [];
  limit = 5;
  offset = 0;



  $http.get('https://query.yahooapis.com/v1/public/yql?q=select%20title%2Cdescription%20from%20rss%20where%20url%3D%22http%3A%2F%2Ffulltextrssfeed.com%2Fwww.punjabspectrum.com%2Ffeed%22%20limit%20' + limit + '%20offset%20' + offset + '&format=json&diagnostics=true&callback=').success(function(data){
    $scope.playlists = data.query.results.item;
    console.log(data.query.results.item);
  })



  $scope.loadMore = function(){
    offset = offset + 5;

    $http.get('https://query.yahooapis.com/v1/public/yql?q=select%20title%2Cdescription%20from%20rss%20where%20url%3D%22http%3A%2F%2Ffulltextrssfeed.com%2Fwww.punjabspectrum.com%2Ffeed%22%20limit%20' + limit + '%20offset%20' + offset + '&format=json&diagnostics=true&callback=').success(function(data){
    $scope.playlists = $scope.playlists.concat(data.query.results.item);
    console.log(data.query.results.item);
  })

  }


  $ionicModal.fromTemplateUrl('templates/modal.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });
  
  $scope.openDetails = function(index) {        
    $scope.currentPlaylist = $scope.playlists[index];
    $scope.modal.show();
  };
  
  $scope.closeModal = function() {
    $scope.modal.hide();
  }

  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
    // $scope.currentPlaylist = {};
    $ionicModal.fromTemplateUrl('templates/modal.html', {
    scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
    });
  });

})

.controller('PlaylistCtrl', function($scope, $stateParams) {
})

.controller('AuthCtrl', function($scope, $location, $stateParams, $ionicHistory, $http, $state, $auth, $rootScope) {

        $scope.loginData = {}
        $scope.loginError = false;
        $scope.loginErrorText;

        $scope.login = function() {

            var credentials = {
                email: $scope.loginData.email,
                password: $scope.loginData.password
            }

            console.log(credentials);

            $auth.login(credentials).then(function() {
                // Return an $http request for the authenticated user
                $http.get('http://localhost:8000/api/authenticate/user').success(function(response){
                    // Stringify the retured data
                    var user = JSON.stringify(response.user);

                    // Set the stringified user data into local storage
                    localStorage.setItem('user', user);

                    // Getting current user data from local storage
                    $rootScope.currentUser = response.user;
                    // $rootScope.currentUser = localStorage.setItem('user');;
                    
                    $ionicHistory.nextViewOptions({
                      disableBack: true
                    });

                    $state.go('app.jokes');
                })
                .error(function(){
                    $scope.loginError = true;
                    $scope.loginErrorText = error.data.error;
                    console.log($scope.loginErrorText);
                })
            });
        }

})

.controller('JokesCtrl', function($scope, $stateParams, $auth, $rootScope, $http, $ionicPopup, $timeout) {
  // $scope.jokes = [
  //   { joke: 'First Joke', id: 1 },
  //   { joke: 'Second Joke', id: 2 },
  //   { joke: 'Third Joke', id: 3 },
  //   { joke: 'Fourth Joke', id: 4 },
  //   { joke: 'Fifth Joke', id: 5 },
  //   { joke: 'Sixth Joke', id: 6 }
  // ];

  // console.log($rootScope.currentUser);
  $scope.jokes = [];
  $scope.error;
  $scope.joke;

  $scope.listCanSwipe = true;

  // Update Popup
  $scope.updatePopup = function(joke, label) {
    console.log(joke,label);
  $scope.data = joke;

  var myPopup = $ionicPopup.show({
    template: '<input type="text" ng-model="data.joke">',
    title: 'Update Joke',
    // subTitle: 'Please use normal things',
    scope: $scope,
    buttons: [
      // { text: 'Cancel' },
      {
        text: '<b>'+label+'</b>',
        type: 'button-positive',
        onTap: function(e) {
          if (!$scope.data.joke) {
            e.preventDefault();
          } else {
            return $scope.data;
          }
        }
      }
    ]
  });
  myPopup.then(function(res) {
    $scope.updateJoke(res);
    console.log(res);
  });
 };

        
  $scope.lastpage=1;
  $scope.init = function() {
                $scope.lastpage=1;
                $http({
                    url: 'http://localhost:8000/api/v1/jokes',
                    method: "GET",
                    params: {page: $scope.lastpage}
                }).success(function(jokes, status, headers, config) {
                    $scope.jokes = jokes.data;
                    $scope.currentpage = jokes.current_page;
                });
            };
  $scope.noMoreItemsAvailable = false;
  $scope.loadMore = function(limit) {
    console.log("Load More Called");
                if(!limit){
                  limit = 5;
                }

                $scope.lastpage +=1;
                $http({
                    url: 'http://localhost:8000/api/v1/jokes',
                    method: "GET",
                    params: {limit: limit, page:  $scope.lastpage}
                }).success(function (jokes, status, headers, config) {
                    console.log(jokes);

                    if (jokes.next_page_url == null){
                         $scope.noMoreItemsAvailable = true;
                     }
 
                    $scope.jokes = $scope.jokes.concat(jokes.data);

 
                });
                $scope.$broadcast('scroll.infiniteScrollComplete');
            };

  $scope.doRefresh = function(){
    $scope.init();
    $scope.loadMore();
    $scope.$broadcast('scroll.refreshComplete');
  }

    $scope.addJoke = function(joke) {

      console.log("add joke: ",joke);

        $http.post('http://localhost:8000/api/v1/jokes', {
            body: joke,
            user_id: $rootScope.currentUser.id
            // user_id: 1
        }).success(function(response) {
            // console.log($scope.jokes);
            // $scope.jokes.push(response.data);
            $scope.jokes.unshift(response.data);
            console.log($scope.jokes);
            $scope.joke = '';
            // alert(data.message);
            // alert("Joke Created Successfully");
        }).error(function(){
          console.log("error");
        });
    };

    $scope.updateJoke = function(joke){
      console.log(joke);
      $http.put('http://localhost:8000/api/v1/jokes/' + joke.joke_id, {
            body: joke.joke,
            user_id: $rootScope.currentUser.id
            // user_id: 1
        }).success(function(response) {
            // alert("Joke Updated Successfully");
        }).error(function(){
          console.log("error");
        });
    }

  $scope.deleteJoke = function(index, jokeId){
      console.log(index, jokeId);

        $http.delete('http://localhost:8000/api/v1/jokes/' + jokeId)
            .success(function() {
                $scope.jokes.splice(index, 1);
            });;
    }

    $scope.init();
});
