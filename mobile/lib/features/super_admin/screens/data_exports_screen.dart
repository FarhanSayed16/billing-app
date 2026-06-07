import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../providers/api_provider.dart';
import '../../../core/utils/web_download.dart' if (dart.library.html) '../../../core/utils/web_download_web.dart';

class DataExportsScreen extends ConsumerStatefulWidget {
  const DataExportsScreen({super.key});

  @override
  ConsumerState<DataExportsScreen> createState() => _DataExportsScreenState();
}

class _DataExportsScreenState extends ConsumerState<DataExportsScreen> {
  bool _isExporting = false;

  void _downloadCsvString(String csvString, String filename) {
    try {
      downloadCsvString(csvString, filename);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Downloads only supported on Web platform currently.')),
      );
    }
  }

  Future<void> _exportData(String endpoint, String filePrefix) async {
    setState(() => _isExporting = true);
    try {
      final dio = ref.read(dioProvider);
      // We need to request data as a response Type of plain text because it's CSV
      final response = await dio.get(
        endpoint,
        options: Options(responseType: ResponseType.plain),
      );
      
      final timestamp = DateTime.now().toIso8601String().replaceAll(':', '-');
      _downloadCsvString(response.data.toString(), '$filePrefix-$timestamp.csv');
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Export downloaded successfully!')),
        );
      }
    } on DioException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Export failed: ${e.message}')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('An unexpected error occurred')),
        );
      }
    } finally {
      setState(() => _isExporting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Data Exports'),
      ),
      body: Stack(
        children: [
          ListView(
            padding: const EdgeInsets.all(24.0),
            children: [
              _buildExportCard(
                title: 'Export Customers',
                description: 'Download a full list of customers with visit and spend data.',
                icon: Icons.people,
                onTap: () => _exportData('/customers/export', 'customers'),
              ),
              const SizedBox(height: 16),
              _buildExportCard(
                title: 'Export Invoices',
                description: 'Download a detailed ledger of all invoices and their status.',
                icon: Icons.receipt_long,
                onTap: () => _exportData('/invoices/export', 'invoices'),
              ),
              const SizedBox(height: 16),
              _buildExportCard(
                title: 'Export Revenue Data',
                description: 'Download daily revenue summaries by store.',
                icon: Icons.attach_money,
                onTap: () => _exportData('/analytics/export/revenue', 'revenue'),
              ),
              const SizedBox(height: 16),
              _buildExportCard(
                title: 'Export Audit Logs',
                description: 'Download system activity and compliance logs.',
                icon: Icons.security,
                onTap: () => _exportData('/audit-logs/export', 'audit-logs'),
              ),
            ],
          ),
          if (_isExporting)
            Container(
              color: Colors.black54,
              child: const Center(
                child: CircularProgressIndicator(),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildExportCard({
    required String title,
    required String description,
    required IconData icon,
    required VoidCallback onTap,
  }) {
    return Card(
      elevation: 2,
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        leading: Icon(icon, size: 40, color: Theme.of(context).primaryColor),
        title: Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 8.0),
          child: Text(description),
        ),
        trailing: OutlinedButton.icon(
          onPressed: onTap,
          icon: const Icon(Icons.download),
          label: const Text('Export CSV'),
        ),
      ),
    );
  }
}
