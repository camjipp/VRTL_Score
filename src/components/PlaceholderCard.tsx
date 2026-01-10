type PlaceholderCardProps = {
  title: string;
  body: string;
};

export function PlaceholderCard({ title, body }: PlaceholderCardProps) {
  return (
    <div className="rounded border p-4">
      <h2 className="font-medium">{title}</h2>
      <p className="mt-2 text-sm">{body}</p>
    </div>
  );
}



