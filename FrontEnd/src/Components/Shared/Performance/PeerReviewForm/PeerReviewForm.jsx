import React, { useState } from 'react';
import './PeerReviewForm.css';
import { useNotification } from '../../../Notification/NotificationContext';
import DashboardLoader from '../../DashboardLoader/DashboardLoader';

const PeerReviewForm = ({ employees = [], onSubmit, isSubmitting = false, lang }) => {
    const currentLang = lang || sessionStorage.getItem('lang') || 'en';
    const isAr = currentLang === 'ar';
    const { showWarning } = useNotification();

    // State variables
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [teamworkScore, setTeamworkScore] = useState(5);
    const [cooperationScore, setCooperationScore] = useState(5);
    const [comment, setComment] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedEmployeeId) {
            showWarning(isAr ? 'الرجاء اختيار الزميل أولاً' : 'Please select a colleague first');
            return;
        }
        if (onSubmit) {
            onSubmit({
                peer_id: selectedEmployeeId,
                teamwork: teamworkScore,
                cooperation: cooperationScore,
                comment: comment
            });
        }
    };

    return (
        <form className="performance-peer-review-form" onSubmit={handleSubmit}>
            <h4 className="peer-form-title">
                <i className="fa-solid fa-user-shield title-icon"></i>
                <span>{isAr ? 'استمارة تقييم الزملاء السرية' : 'Secure Anonymous Peer Review'}</span>
            </h4>

            {/* Security Notice */}
            <div className="security-notice-box">
                <i className="fa-solid fa-lock security-icon"></i>
                <div className="security-text-content">
                    <strong>{isAr ? 'حماية السرية والتشفير الشامل:' : 'Confidentiality & AES-256 Encryption:'}</strong>
                    <p>
                        {isAr 
                            ? 'هذا التقييم سري ومجهول الهوية بالكامل. يتم تشفير التعليقات تلقائياً باستخدام بروتوكول AES-256-CBC ولن تظهر هويتك للزميل أو لقسم الموارد البشرية.'
                            : 'This evaluation is completely anonymous. Comments are automatically encrypted using AES-256-CBC protocol. Your identity is never exposed to peers or HR.'}
                    </p>
                </div>
            </div>

            {/* Select Colleague */}
            <div className="peer-form-group">
                <label className="peer-form-label">
                    {isAr ? 'الزميل المُراد تقييمه' : 'Colleague to Evaluate'} <span className="req">*</span>
                </label>
                <select 
                    className="peer-select-control"
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    required
                >
                    <option value="">{isAr ? '-- اختر من زملائك في القسم --' : '-- Select a Colleague --'}</option>
                    {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                            {emp.name} {emp.department ? `(${emp.department})` : ''}
                        </option>
                    ))}
                </select>
            </div>

            {/* Teamwork Slider */}
            <div className="peer-range-container">
                <div className="peer-range-header">
                    <span className="peer-range-title">
                        <i className="fa-solid fa-people-group"></i> {isAr ? 'العمل الجماعي (Teamwork)' : 'Teamwork'}
                    </span>
                    <span className="peer-range-val">{teamworkScore} / 10</span>
                </div>
                <input 
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    className="peer-custom-range"
                    value={teamworkScore}
                    onChange={(e) => setTeamworkScore(parseInt(e.target.value))}
                />
                <span className="slider-hint">
                    {isAr ? 'مدى المساهمة الفعالة والعمل بروح الفريق' : 'Degree of active team contribution and team spirit'}
                </span>
            </div>

            {/* Cooperation Slider */}
            <div className="peer-range-container">
                <div className="peer-range-header">
                    <span className="peer-range-title">
                        <i className="fa-solid fa-handshake-angle"></i> {isAr ? 'التعاون والمساعدة (Cooperation)' : 'Cooperation'}
                    </span>
                    <span className="peer-range-val">{cooperationScore} / 10</span>
                </div>
                <input 
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    className="peer-custom-range"
                    value={cooperationScore}
                    onChange={(e) => setCooperationScore(parseInt(e.target.value))}
                />
                <span className="slider-hint">
                    {isAr ? 'مدى الاستعداد لمساعدة الآخرين ومشاركة المعرفة' : 'Readiness to support others and share knowledge'}
                </span>
            </div>

            {/* Encrypted comment */}
            <div className="peer-form-group">
                <label className="peer-form-label">
                    {isAr ? 'ملاحظات إضافية (تُحفظ مشفرة بالكامل)' : 'Additional Comments (Stored Fully Encrypted)'}
                </label>
                <textarea 
                    className="peer-textarea-control"
                    placeholder={isAr ? 'اكتب ملاحظاتك المهنية هنا... لن يتم الكشف عن اسمك أبداً' : 'Write professional feedback... your identity will never be revealed'}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
            </div>

            {/* Submit Button */}
            <button 
                type="submit" 
                className="peer-submit-btn" 
                disabled={isSubmitting || !selectedEmployeeId}
            >
                {isSubmitting ? (
                    <>
                        <DashboardLoader size="xs" inline text="" />
                        <span style={{ marginInlineStart: '6px' }}>{isAr ? 'جاري التشفير والإرسال...' : 'Encrypting & Submitting...'}</span>
                    </>
                ) : (
                    <>
                        <i className="fa-solid fa-paper-plane"></i>
                        <span>{isAr ? 'إرسال التقييم السري' : 'Submit Secure Review'}</span>
                    </>
                )}
            </button>
        </form>
    );
};

export default PeerReviewForm;
