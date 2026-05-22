import { useTranslation } from "react-i18next";
import './Attachments.css';
import DocumentsAttachments from "../Documents-Attachments/DocumentsAttachments";
import { downloadResume } from "../../../../services/atsService";

export default function Attachments({ name, att, onClose, applicationId }) {
    const { t } = useTranslation("Recrutment/Attachments");

    const close = (e) => {
        if (onClose) {
            onClose();
            return;
        }
        const element = document.querySelector('.shinvisibility');
        if (element) {
            element.className = 'shinhidden';
        }
    };

    const handleDownloadAll = async () => {
        if (!applicationId) return;
        try {
            const res = await downloadResume(applicationId);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${name}_resume.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            alert('Could not download attachments.');
        }
    };

    // Standard mock files as fallback
    const mockFiles = [
      {
        id: 1,
        name: "Resume_Final.pdf",
        size: 2.4,
        sizeUnit: "MB",
        type: "pdf",
      },
      {
        id: 2,
        name: "Cover_Letter.docx",
        size: 1.2,
        sizeUnit: "MB",
        type: "word",
      }
    ];

    const finalFiles = (att && att.length > 0) ? att.map((a) => {
        const ext = a.file_name.split('.').pop().toLowerCase();
        let type = 'pdf';
        if (['doc', 'docx'].includes(ext)) type = 'word';
        else if (['xls', 'xlsx'].includes(ext)) type = 'excel';
        else if (ext === 'zip') type = 'zip';

        const match = a.file_size_human ? a.file_size_human.match(/^([\d\.]+)\s*(.*)$/) : null;
        const size = match ? parseFloat(match[1]) : 0;
        const sizeUnit = match ? match[2] : 'KB';

        return {
            id: a.id,
            name: a.file_name,
            size: size,
            sizeUnit: sizeUnit,
            type: type,
        };
    }) : mockFiles;

    const totalSize = finalFiles.reduce((acc, f) => acc + (f.size || 0), 0).toFixed(1);
    const sizeUnit = finalFiles[0]?.sizeUnit || 'MB';

    return (
        <div className="sh_In_scr">
            <div className="attachments">
                <div className="att-name-x">
                    <div>
                        <p className="att-name">{name}</p>
                        <p className="att-attachments">{t('attachments') || 'Attachments'}</p>
                    </div>
                    <div className="down-x">
                        <button className="btn-move calender" onClick={handleDownloadAll}>
                            <i className="bi bi-download"></i>
                            <span>{t('download') || 'Download'}</span>
                        </button>
                        <button className='sh_In_x x' type='button' onClick={close}>x</button>
                    </div>
                </div>
                <div className="doc">
                    {finalFiles.map((file) => (
                        <DocumentsAttachments
                            key={file.id}
                            files={file}
                            onDownload={handleDownloadAll}
                        />
                    ))}
                </div>
                <div className="total">
                    <p>{finalFiles.length} {t('Documents') || 'Documents'} ({totalSize} {sizeUnit})</p>
                </div>
            </div>
        </div>
    );
}