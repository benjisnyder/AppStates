// TODO: NEED TO ADD AN EVENT SYSTEM


var App = window.App ? window.App : (function() {
	var _states = {},
		_data = {},
		prev_states = [],
		$body = $('body'),

		transition = function($targ, $prev) {
			if ($prev) {
				$prev.animate({opacity:0}, 200, function() {
					$prev.hide();
				});
			}

			if ($targ) {
				$targ.show();
				$targ.animate({opacity:1}, 200);
			}
		},

		register = function(name, obj, isMainState) {
			_states[name] = new State(name, isMainState);

			for (var prop in obj) {
			    if (obj.hasOwnProperty(prop)) {
			        _states[name][prop] = obj[prop];
			    }
			}

			if (obj.setup) {
				_states[name].setup(_states[name]);
			}
		},

		setData = function(name, obj, state) {
			if (state) {
				// store the value internally to the state
				if (!state._data) {
					state._data = {};
				}

				state._data[name] = obj;
			} else {
				_data[name] = obj;
			}
		},

		getData = function(name, state) {
			if (state && state._data && state._data[name]) {
				return state._data[name];
			} else if (typeof _data[name] !== 'undefined') {
				return _data[name];
			} else {
				return null;
			}
		},
 
		State = function(viewId, isMainState) {
			var _state = this;

			_state.firstDone = false;

			_state.prep = function(__state, obj) {
				var $state = $('#' + viewId);

				if (!_state.firstDone && _state.once) {
					_state.once(__state, obj);
					_state.firstDone = true;
				}

				// remove old states and classes if switching to a main state
				if (prev_states.length > 0 && isMainState) {
					$(prev_states).each(function(i) {
						var _state = prev_states[i];

						if (_state.isMainState) {
							transition(null, _state.$obj);
						}

						$body.removeClass(_state.name);
					});

					prev_states = [];
				} 

				if (isMainState === true) {
					transition($state);
				}

				$body.addClass(viewId);

				prev_states.push({$obj : $state, name : viewId, isMainState : isMainState});
			};

			_state.deprep = function() {
				$body.removeClass(viewId);
			};

			_state.setData = function(name, data) {
				setData(name, data, _state);
			};

			_state.getData = function(name) {
				return getData(name, _state);
			}
		};

	return {
		setData : function(name, obj) {
			setData(name, obj);
		},

		getData : function(name) {
			return getData(name);
		},

		state : function(name, obj) {
			register(name, obj, true);
		},

		subState : function(name, obj) {
			register(name, obj, false);
		},

		set : function(name, obj) {
			var _state = _states[name];

			if (typeof _state !== 'undefined') {
				if (_state.prep) {
					_state.prep(_state, obj);
				}

				if (_state.enter) {
					_state.enter(_state, obj);
				}
			}
		},

		exit : function(name, obj) {
			var _state = _states[name];

			if (typeof _state !== 'undefined') {

				_state.deprep();
				
				if (_state.exit) {
					_state.exit(_state, obj);
				}
			}
		},

		stateClass : function(cls) {
			$body.addClass(cls);
		}
	}
})();