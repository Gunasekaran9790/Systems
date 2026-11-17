
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  deleteQuotation,
  getQuotations,
  updateQuotationStatus,
  downloadQuotationPDF,
  previewQuotationPDF,
} from '../../api/quotationAPI';

import type {
  Quotation,
  QuotationStatus,
} from '../../types/quotationTypes';

export default function QuotationList() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const loadQuotations = async () => {
    try {
      setLoading(true);
      setError('');
      setQuotations(await getQuotations());
    } catch {
      setError('Unable to load quotations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotations();
  }, []);

  const filtered = quotations.filter((quotation) =>
    `${quotation.quotation_no} ${quotation.customer_name}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const changeStatus = async (
    id: number,
    status: QuotationStatus,
  ) => {
    try {
      await updateQuotationStatus(id, status);
      await loadQuotations();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Status update failed',
      );
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm('Delete this draft quotation?')) return;

    try {
      await deleteQuotation(id);
      await loadQuotations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const generatePDF = async (id: number, quotationNo: string) => {
    try {
      setDownloadingId(id);
      setError('');

      const pdfBlob = await downloadQuotationPDF(id);

      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');

      link.href = url;
      link.download = `${quotationNo}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

    //   window.URL.revokeObjectURL(url);
    setTimeout(() => {
    window.URL.revokeObjectURL(url);
    }, 1000);

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to generate quotation PDF',
      );
    } finally {
      setDownloadingId(null);
    }
  };

  // PDF TESTER
//   const handlePreviewPDF = async (id: number) => {
//   // Open a blank tab immediately to avoid popup blocking
//   const previewWindow = window.open('', '_blank');

//   if (!previewWindow) {
//     alert('Please allow popups to preview the quotation.');
//     return;
//   }

//   try {
//     const blob = await previewQuotationPDF(id);
//     const pdfUrl = URL.createObjectURL(blob);

//     previewWindow.location.href = pdfUrl;

//     // Keep the URL available while the PDF loads and is viewed.
//     // It is released after the preview tab is closed.
//     const releaseUrl = () => URL.revokeObjectURL(pdfUrl);
//     previewWindow.addEventListener('pagehide', releaseUrl, { once: true });

//   } catch (error) {
//     previewWindow.close();

//     alert(
//       error instanceof Error
//         ? error.message
//         : 'Unable to preview quotation',
//     );
//   }
// };

const handlePreviewPDF = async (id: number) => {
  const previewWindow = window.open('', '_blank');

  if (!previewWindow) {
    alert('Please allow popups to preview the quotation.');
    return;
  }

  try {
    const blob = await previewQuotationPDF(id);
    const pdfUrl = URL.createObjectURL(blob);

    previewWindow.location.href = pdfUrl;

    previewWindow.addEventListener(
      'pagehide',
      () => URL.revokeObjectURL(pdfUrl),
      { once: true },
    );
  } catch (error) {
    previewWindow.close();

    alert(
      error instanceof Error
        ? error.message
        : 'Unable to preview quotation',
    );
  }
};


  if (loading) {
    return <div className="p-6">Loading quotations...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">Quotations</h2>

        <Link
          to="/quotations/add"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Add Quotation
        </Link>
      </div>

      {error && (
        <p className="mb-3 rounded bg-red-50 p-3 text-red-700">
          {error}
        </p>
      )}

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search quotation number or customer"
        className="mb-4 w-full rounded border p-2 md:max-w-sm"
      />

      <div className="overflow-x-auto rounded border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Quotation No.</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-right">Total</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((quotation) => (
              <tr key={quotation.id} className="border-t">
                <td className="p-3 font-medium">
                  {quotation.quotation_no}
                </td>

                <td className="p-3">
                  {quotation.customer_name}
                </td>

                <td className="p-3">
                  {String(quotation.quotation_date).slice(0, 10)}
                </td>

                <td className="p-3 text-right">
                  {Number(quotation.total_amount).toFixed(2)}
                </td>

                <td className="p-3">
                  <select
                    value={quotation.status}
                    onChange={(e) =>
                      changeStatus(
                        quotation.id,
                        e.target.value as QuotationStatus,
                      )
                    }
                    className="rounded border p-1"
                  >
                    <option value={quotation.status}>
                      {quotation.status}
                    </option>

                    {quotation.status === 'DRAFT' && (
                      <>
                        <option value="SENT">SENT</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </>
                    )}

                    {quotation.status === 'SENT' && (
                      <>
                        <option value="ACCEPTED">ACCEPTED</option>
                        <option value="REJECTED">REJECTED</option>
                        <option value="EXPIRED">EXPIRED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </>
                    )}
                  </select>
                </td>

                <td className="p-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      to={`/quotations/view/${quotation.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </Link>

                    {quotation.status === 'DRAFT' && (
                      <>
                        <Link
                          to={`/quotations/edit/${quotation.id}`}
                          className="text-green-600 hover:underline"
                        >
                          Edit
                        </Link>

                        <button
                          type="button"
                          onClick={() => remove(quotation.id)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => generatePDF(quotation.id, quotation.quotation_no)}
                      disabled={downloadingId === quotation.id}
                      className="text-purple-600 hover:underline disabled:opacity-50"
                    >
                      {downloadingId === quotation.id
                        ? 'Generating...'
                        : 'Download PDF'}
                    </button>

                    <button
                        onClick={() => handlePreviewPDF(quotation.id)}
                        className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                        >
                        Preview PDF
                    </button>

                  </div>
                </td>
              </tr>
            ))}

            {!filtered.length && (
              <tr>
                <td
                  colSpan={6}
                  className="p-5 text-center text-gray-500"
                >
                  No quotations found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
