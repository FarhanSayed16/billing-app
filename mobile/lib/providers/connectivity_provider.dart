import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

class ConnectivityState {
  final bool isOnline;
  
  ConnectivityState({this.isOnline = true});
}

class ConnectivityNotifier extends Notifier<ConnectivityState> {
  StreamSubscription<List<ConnectivityResult>>? _subscription;

  @override
  ConnectivityState build() {
    _init();
    ref.onDispose(() {
      _subscription?.cancel();
    });
    return ConnectivityState(isOnline: true);
  }

  Future<void> _init() async {
    final results = await Connectivity().checkConnectivity();
    _updateState(results);

    _subscription = Connectivity().onConnectivityChanged.listen((results) {
      _updateState(results);
    });
  }

  void _updateState(List<ConnectivityResult> results) {
    if (results.contains(ConnectivityResult.none)) {
      if (state.isOnline) {
        state = ConnectivityState(isOnline: false);
      }
    } else {
      if (!state.isOnline) {
        state = ConnectivityState(isOnline: true);
      }
    }
  }
}

final connectivityProvider = NotifierProvider<ConnectivityNotifier, ConnectivityState>(() {
  return ConnectivityNotifier();
});
