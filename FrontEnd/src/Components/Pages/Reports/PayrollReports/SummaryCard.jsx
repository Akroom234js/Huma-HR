import MetricRow from './MetricRow';
import { useTranslation } from 'react-i18next';

const SummaryCard = ({ title, metrics }) => {
    const { t } = useTranslation('Reports/PayrollReports');

    return (
        <div className="report-card">
            <h3 className="card-title">{t(title)}</h3>
            <div className="metrics-list">
                {metrics.map((item, index) => (
                    <MetricRow
                        key={index}
                        {...item}
                        label={t(item.label)}
                    />
                ))}
            </div>
        </div>
    );
};

export default SummaryCard;