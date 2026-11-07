// window.whilo belongs in the application adapter.
export const documentation = "window.whilo";
export const viewport = () => window.innerWidth;
export const platformAction = (props: { whilo: () => void }) => props.whilo();
