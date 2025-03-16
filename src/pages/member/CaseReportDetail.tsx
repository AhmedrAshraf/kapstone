import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Reply, X, Check, Tag } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { CaseReport, CaseReportReply } from '../../types/supabase';
import { useAuthStore } from '../../store/authStore';
import { MarkdownEditor } from '../../components/editor/MarkdownEditor';
import { MarkdownPreview } from '../../components/editor/MarkdownPreview';
import { useScrollToTop } from '../../hooks/useScrollToTop';

export function CaseReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [report, setReport] = useState<CaseReport | null>(null);
  const [replies, setReplies] = useState<CaseReportReply[]>([]);
  const [newReply, setNewReply] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useScrollToTop();

  useEffect(() => {
    loadReport();
    loadReplies();
  }, [id]);

  const loadReport = async () => {
    try {
      const { data, error } = await supabase
        .from('case_reports')
        .select(`
          *,
          author:users!case_reports_author_id_fkey(full_name, email)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setReport(data);
    } catch (err) {
      console.error('Error loading case report:', err);
      setError('Failed to load case report');
    } finally {
      setLoading(false);
    }
  };

  const loadReplies = async () => {
    try {
      const { data, error } = await supabase
        .from('case_report_replies')
        .select(`
          *,
          author:users!case_report_replies_author_id_fkey(full_name, email)
        `)
        .eq('report_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setReplies(data || []);
    } catch (err) {
      console.error('Error loading replies:', err);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !newReply.trim() || !id) return;

    try {
      const { error } = await supabase
        .from('case_report_replies')
        .insert([{
          report_id: id,
          author_id: user.id,
          content: newReply,
          parent_id: replyToId
        }]);

      if (error) throw error;
      
      setNewReply('');
      setReplyToId(null);
      await loadReplies();
    } catch (err) {
      console.error('Error creating reply:', err);
    }
  };

  const handleEditReply = async (replyId: string) => {
    if (!user?.id || !editedContent.trim()) return;

    try {
      const { error } = await supabase
        .from('case_report_replies')
        .update({ content: editedContent })
        .eq('id', replyId)
        .eq('author_id', user.id);

      if (error) throw error;
      
      setEditingReplyId(null);
      setEditedContent('');
      await loadReplies();
    } catch (err) {
      console.error('Error updating reply:', err);
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!user?.id) return;
    
    if (!window.confirm('Are you sure you want to delete this reply?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('case_report_replies')
        .delete()
        .eq('id', replyId)
        .eq('author_id', user.id);

      if (error) throw error;
      await loadReplies();
    } catch (err) {
      console.error('Error deleting reply:', err);
    }
  };

  const handleDelete = async () => {
    if (!user?.id || !report || isDeleting) return;
    
    if (!window.confirm('Are you sure you want to delete this case report?')) {
      return;
    }

    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('case_reports')
        .delete()
        .eq('id', report.id);

      if (error) throw error;
      navigate('/member-hub/case-reports');
    } catch (err) {
      console.error('Error deleting case report:', err);
      setError('Failed to delete case report. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const canEdit = user?.role === 'super_admin' || user?.id === report?.author_id;

  const canEditReply = (reply: CaseReportReply) => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    
    const isAuthor = user.id === reply.author_id;
    const isWithin24Hours = (new Date().getTime() - new Date(reply.created_at).getTime()) / (1000 * 60 * 60) <= 24;
    
    return isAuthor && isWithin24Hours;
  };

  const formatQuote = (reply: CaseReportReply) => {
    const authorName = reply.author?.full_name || reply.author?.email;
    const lines = reply.content.split('\n');
    const quotedLines = lines.map(line => `> ${line}`).join('\n');
    return `@${authorName} wrote:\n\n${quotedLines}\n\n`;
  };

  const renderReplies = (parentId: string | null = null, depth = 0): JSX.Element[] => {
    return replies
      .filter(reply => reply.parent_id === parentId)
      .map(reply => (
        <div 
          key={reply.id} 
          className={`bg-white rounded-lg shadow-lg p-6 ${
            depth > 0 ? 'ml-8 border-l-4 border-kapstone-sage/20' : ''
          }`}
        >
          {editingReplyId === reply.id ? (
            <div className="space-y-4">
              <MarkdownEditor
                value={editedContent}
                onChange={setEditedContent}
                rows={4}
                placeholder="Edit your reply..."
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setEditingReplyId(null);
                    setEditedContent('');
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleEditReply(reply.id)}
                  className="p-2 text-kapstone-sage hover:text-kapstone-sage-dark rounded-full hover:bg-gray-100"
                >
                  <Check className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="prose prose-lg max-w-none mb-4">
                <MarkdownPreview content={reply.content} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <span>By {reply.author?.full_name || reply.author?.email}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(reply.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setReplyToId(reply.id);
                      setNewReply(formatQuote(reply));
                      document.getElementById('reply-form')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="p-2 text-gray-500 hover:text-kapstone-sage rounded-full hover:bg-gray-100"
                  >
                    <Reply className="h-5 w-5" />
                  </button>
                  {canEditReply(reply) && (
                    <>
                      <button
                        onClick={() => {
                          setEditingReplyId(reply.id);
                          setEditedContent(reply.content);
                        }}
                        className="p-2 text-gray-500 hover:text-kapstone-sage rounded-full hover:bg-gray-100"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteReply(reply.id)}
                        className="p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
          {renderReplies(reply.id, depth + 1)}
        </div>
      ));
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-kapstone-sage border-t-transparent"></div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="p-8">
        <div className="text-center text-red-600">
          {error || 'Case report not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <Link
        to="/member-hub/case-reports"
        className="inline-flex items-center text-kapstone-sage hover:text-kapstone-sage-dark mb-8"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Case Reports
      </Link>

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-start justify-between mb-6">
            <h1 className="text-3xl font-bold text-kapstone-purple">
              {report.title}
            </h1>
            {canEdit && !isDeleting && (
              <div className="flex items-center space-x-2">
                <Link
                  to={`/member-hub/case-reports/edit/${report.id}`}
                  className="p-2 text-gray-500 hover:text-kapstone-sage rounded-full hover:bg-gray-100"
                >
                  <Edit2 className="h-5 w-5" />
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100 disabled:opacity-50"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Patient Information</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Age</dt>
                  <dd className="text-gray-900">{report.patient_info.age || 'Not specified'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Gender</dt>
                  <dd className="text-gray-900">{report.patient_info.gender || 'Not specified'}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Categories & Keywords</h3>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {report.diagnostic_categories.map((category) => (
                    <span
                      key={category}
                      className="px-2 py-1 bg-kapstone-sage/10 text-kapstone-sage rounded-full text-sm"
                    >
                      {category}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {report.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {report.assessment && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Assessment</h3>
                <div className="prose prose-lg max-w-none">
                  <MarkdownPreview content={report.assessment} />
                </div>
              </div>
            )}

            {report.treatment_plan && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Treatment Plan</h3>
                <div className="prose prose-lg max-w-none">
                  <MarkdownPreview content={report.treatment_plan} />
                </div>
              </div>
            )}

            {report.session_notes && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Session Notes</h3>
                <div className="prose prose-lg max-w-none">
                  <MarkdownPreview content={report.session_notes} />
                </div>
              </div>
            )}

            {report.outcomes && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Outcomes</h3>
                <div className="prose prose-lg max-w-none">
                  <MarkdownPreview content={report.outcomes} />
                </div>
              </div>
            )}

            {report.recommendations && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Recommendations</h3>
                <div className="prose prose-lg max-w-none">
                  <MarkdownPreview content={report.recommendations} />
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div>
                Posted by {report.author?.full_name || report.author?.email}
              </div>
              <div>
                {new Date(report.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Replies */}
        <div className="space-y-6">
          {renderReplies()}
        </div>

        {/* Reply Form */}
        <div id="reply-form" className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-semibold text-kapstone-purple mb-4">
            {replyToId ? 'Reply to Comment' : 'Add a Reply'}
          </h2>
          <form onSubmit={handleReply} className="space-y-4">
            <MarkdownEditor
              value={newReply}
              onChange={setNewReply}
              rows={6}
              placeholder="Write your reply... (Markdown supported)"
            />
            <div className="flex justify-end gap-4">
              {replyToId && (
                <button
                  type="button"
                  onClick={() => {
                    setReplyToId(null);
                    setNewReply('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel Reply
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2 bg-kapstone-sage text-white rounded-md hover:bg-kapstone-sage-dark"
              >
                Post Reply
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}