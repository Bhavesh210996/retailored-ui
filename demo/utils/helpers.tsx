export const formatDate = (date: Date | null) => {
    return date ? date.toLocaleDateString('en-IN') : 'Not scheduled';
};

export const formatDateTime = (dateStr?: string | null) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};