const ProgressBar = ({isProgress}) => {
    return (
        <>
            {isProgress && <div className='progress'></div>}
        </>
    );
}

export default ProgressBar;
