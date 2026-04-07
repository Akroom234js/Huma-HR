import { useTranslation } from 'react-i18next';

const DepartmentCard = ({ name, headcount, total, avg }) => {
    const { t } = useTranslation('Reports/PayrollReports');

    return (
        <div className="dept-card">
            <div className="dept-header">
                <div>
                    <h4>{name}</h4>
                    <p>{t('labels.headcount')}: {headcount}</p>
                </div>
                <div className="dept-values">
                    <p className="dept-total">{t('labels.total')}: <strong>{total}</strong></p>
                    <p className="dept-avg">{t('labels.avg')}: {avg}</p>
                </div>
            </div>
        </div>
    );
};

export default DepartmentCard;