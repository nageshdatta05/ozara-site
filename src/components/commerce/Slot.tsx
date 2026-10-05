/**
 * A marker for content that does not exist yet (press, testimonials…).
 * It renders nothing: the code documents where content goes, visitors never
 * see a placeholder.
 */
export function Slot(_props: { name: string; spec: string; className?: string }) {
  void _props;
  return null;
}
