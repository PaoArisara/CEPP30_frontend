interface BreadcrumbProps {
  pageName: string;
}
const Breadcrumb = ({ pageName }: BreadcrumbProps) => {
  return (
    <nav>
      <ol className="flex text-header flex-col">
        <li>
          <div className="opacity-70">
            หน้า / {pageName}
          </div>
        </li>
        <li className="font-bold text-xl">{pageName}</li>
      </ol>
    </nav>
  );
};

export default Breadcrumb;
