import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Avatar,
  CircularProgress,
  Button,
} from '@mui/material';
import { useAppSelector } from '../../hooks/redux';
import { useGetIssueByIdQuery, useGetIssueUpdatesQuery, useAddIssueUpdateMutation } from '../../store/api/issuesApi';
import { TextField, InputAdornment, IconButton, MenuItem } from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';

const IssueDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useGetIssueByIdQuery(id || '', {
    skip: !id,
  });
  const { data: updatesData, refetch: refetchUpdates } = useGetIssueUpdatesQuery(id || '', { skip: !id });
  const [addUpdate, { isLoading: isAdding }] = useAddIssueUpdateMutation();
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user && ['admin', 'department', 'staff'].includes(user.role);

  const [note, setNote] = React.useState('');
  const [status, setStatus] = React.useState<string>('');
  const [files, setFiles] = React.useState<FileList | null>(null);

  const handleSubmitUpdate = async () => {
    if (!id) return;
    const formData = new FormData();
    if (note.trim()) formData.append('note', note.trim());
    if (status) formData.append('status', status);
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => formData.append('images', file));
    }
    await addUpdate({ id, formData }).unwrap();
    setNote('');
    setStatus('');
    setFiles(null);
    refetch();
    refetchUpdates();
  };

  if (isLoading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minHeight={300}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !data?.success || !data.data) {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>Issue not found</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          There was a problem loading this issue. Please try again.
        </Typography>
        <Button variant="outlined" onClick={() => refetch()}>Retry</Button>
      </Box>
    );
  }

  const issue = data.data;

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          {issue.title}
        </Typography>
        <Box display="flex" gap={1}>
          <Chip label={issue.category} color="primary" variant="outlined" />
          <Chip label={issue.priority} color={issue.priority === 'critical' ? 'error' : issue.priority === 'high' ? 'warning' : 'default'} />
          <Chip label={issue.status} sx={{ fontWeight: 700 }} />
        </Box>
      </Box>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        Issue ID: {issue._id}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              {issue.images && issue.images.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <img
                    src={issue.images[0].url}
                    alt="Issue"
                    style={{ width: '100%', height: 320, objectFit: 'cover', borderRadius: 8 }}
                  />
                </Box>
              )}
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {issue.description}
              </Typography>

              {issue.address && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Location
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    📍 {issue.address}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ({issue.latitude.toFixed(5)}, {issue.longitude.toFixed(5)})
                  </Typography>
                </>
              )}
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Progress timeline
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                {(updatesData?.data || []).length === 0 && (
                  <Typography variant="body2" color="text.secondary">No updates yet.</Typography>
                )}
                {(updatesData?.data || []).map((u, idx) => (
                  <Box key={idx} sx={{ p: 1.5, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Typography fontWeight={600}>{u.createdBy?.name || 'Unknown'}</Typography>
                      <Typography variant="caption" color="text.secondary">{new Date(u.createdAt).toLocaleString()}</Typography>
                    </Box>
                    {u.status && (
                      <Chip label={u.status} size="small" sx={{ mr: 1, mb: 1 }} />
                    )}
                    {u.note && (
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{u.note}</Typography>
                    )}
                    {u.images && u.images.length > 0 && (
                      <Box display="flex" gap={1} mt={1} sx={{ flexWrap: 'wrap' }}>
                        {u.images.map((img, i) => (
                          <img key={i} src={img.url} alt={`update-${i}`} style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 6 }} />
                        ))}
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Reporter
              </Typography>
              <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
                <Avatar>{issue.reportedBy.name?.charAt(0).toUpperCase()}</Avatar>
                <Box>
                  <Typography fontWeight={600}>{issue.reportedBy.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{issue.reportedBy.email}</Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Metadata
              </Typography>
              <Box display="flex" flexDirection="column" gap={0.5}>
                <Typography variant="body2">Created: {new Date(issue.createdAt).toLocaleString()}</Typography>
                <Typography variant="body2">Updated: {new Date(issue.updatedAt).toLocaleString()}</Typography>
                <Typography variant="body2">Upvotes: {issue.upvotes?.length || 0}</Typography>
                <Typography variant="body2">Downvotes: {issue.downvotes?.length || 0}</Typography>
              </Box>

              {isAdmin && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Add progress update
                  </Typography>
                  <TextField
                    label="Note (optional)"
                    multiline
                    minRows={3}
                    fullWidth
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    margin="dense"
                  />
                  <TextField
                    label="Status (optional)"
                    select
                    fullWidth
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    margin="dense"
                  >
                    {['pending','acknowledged','in-progress','resolved','rejected'].map(s => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </TextField>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    sx={{ mt: 1 }}
                  >
                    Upload images
                    <input hidden multiple type="file" accept="image/*" onChange={(e) => setFiles(e.target.files)} />
                  </Button>
                  <Button
                    variant="contained"
                    fullWidth
                    disabled={isAdding}
                    onClick={handleSubmitUpdate}
                    sx={{ mt: 1.5 }}
                  >
                    {isAdding ? 'Saving...' : 'Save update'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default IssueDetailPage;
