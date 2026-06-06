import 'dart:typed_data';
import 'package:web/web.dart' as web;
import 'dart:js_interop';

void downloadCsvString(String csvString, String filename) {
  final bytes = Uint8List.fromList(csvString.codeUnits);
  final blob = web.Blob([bytes.toJS].toJS);
  final url = web.URL.createObjectURL(blob);
  
  final anchor = web.HTMLAnchorElement()
    ..href = url
    ..download = filename;
    
  anchor.click();
  web.URL.revokeObjectURL(url);
}
