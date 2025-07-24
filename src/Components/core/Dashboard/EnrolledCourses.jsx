import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import {getUserCourses as getUserEnrolledCourses}  from '../../../services/operations/profileAPI';
import ProgressBar from '@ramonak/react-progress-bar';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import axios from 'axios';

const EnrolledCourses = () => {
    const dispatch=useDispatch();

    const {token}  = useSelector((state) => state.auth);

    const [enrolledCourses, setEnrolledCourses] = useState(undefined);
    const [progressData, setProgressData] = useState(undefined);
    const [Loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [quizStatus, setQuizStatus] = useState({});


    const getEnrolledCourses = async() => {
        setLoading(true);
            const response = await getUserEnrolledCourses(token,dispatch);
            console.log("getEnrolledCourses -> response", response?.courseProgress);
            setLoading(false);
            setEnrolledCourses(response?.courses);
            setProgressData(response?.courseProgress);

    }

    const totalNoOfLectures = (course) => {
        let total = 0;
        course.courseContent.forEach((section) => {
            total += section.subSection.length;
        });
        return total;
    }

    useEffect(()=> {
        getEnrolledCourses();
    },[]);

    useEffect(() => {
      const fetchQuizStatus = async () => {
        if (!enrolledCourses) return;
        const token = localStorage.getItem('token');
        const statusObj = {};
        for (const course of enrolledCourses) {
          try {
            const quizRes = await axios.get(`/api/v1/quiz/${course._id}`, { headers: { Authorization: `Bearer ${token}` } });
            const quizId = quizRes.data.quiz._id;
            const attemptRes = await axios.get(`/api/v1/quiz-attempt/${quizId}`, { headers: { Authorization: `Bearer ${token}` } });
            if (attemptRes.data.attempt) {
              if (attemptRes.data.attempt.completed) {
                statusObj[course._id] = { type: 'view', score: attemptRes.data.attempt.score, total: quizRes.data.quiz.questions.length };
              } else {
                statusObj[course._id] = { type: 'resume' };
              }
            } else {
              statusObj[course._id] = { type: 'take' };
            }
          } catch {
            statusObj[course._id] = null;
          }
        }
        setQuizStatus(statusObj);
      };
      fetchQuizStatus();
    }, [enrolledCourses]);

    if(Loading) {
        return (
            <div className='flex h-[calc(100vh)] w-full justify-center items-center'>
                <div className='animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-richblack-500'></div>
            </div>
        )
    }


  return (
    <div className='mx-auto w-11/12 max-w-[1000px] py-10'>

        <div className='text-3xl text-richblack-50 font-bold animate-bounce-in mb-6'>
          <span className='inline-block animate-gradient-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent'>Enrolled Courses</span>
        </div>
        {
            !enrolledCourses ? (<div className='animate-fade-in-up text-lg text-richblack-200'>
                Loading...
            </div>)
            : !enrolledCourses.length ? (<p className='grid h-[10vh] w-full place-content-center text-richblack-5 animate-fade-in-up'>You have not enrolled in any course yet</p>)
            : (
                <div className='my-8 text-richblack-5'>
                    <div className='flex rounded-t-lg bg-richblack-500 '>
                        <p className='w-[45%] px-5 py-3'>Course Name</p>
                        <p className='w-1/4 px-2 py-3'></p>
                        <p className='flex-1 px-2 py-3'>Progress</p>
                    </div>
                    {/* Cards shure hote h ab */}
                    {
                        enrolledCourses.map((course,index)=> (
                            <div key={index} onClick={()=>{
                                navigate(`view-course/${course._id}/section/${course.courseContent[0]._id}/sub-section/${course.courseContent[0].subSection[0]}`)}}
                                 className={`flex items-center border border-richblack-700 rounded-none bg-richblack-800 transition-transform duration-500 ease-out transform hover:scale-[1.025] hover:shadow-2xl hover:border-yellow-200/60 cursor-pointer animate-fade-in-up mb-4`} style={{animationDelay: `${index * 80}ms`}}>
                                <div className='flex w-[45%] cursor-pointer items-center gap-4 px-5 py-3'>
                                    <img className='h-14 w-14 rounded-lg object-cover transition-transform duration-300 hover:scale-110'  src={course.thumbnail}/>
                                    <div className='flex max-w-xs flex-col gap-2'>
                                        <p className='font-semibold'>{course.courseName}</p>
                                        <p className='text-xs text-richblack-300 hidden md:block'>{
                                            //description with max 50 characters
                                            course.courseDescription.length > 50 ? course.courseDescription.slice(0,50) + '....' : course.courseDescription
                                        }</p>
                                    </div>
                                </div>
                                {quizStatus[course._id]?.type === 'take' && (
                                  <Link to={`/courses/${course._id}/quiz`} className="ml-4 px-3 py-1 bg-yellow-400 text-black rounded hover:bg-yellow-500">Take Quiz</Link>
                                )}
                                {quizStatus[course._id]?.type === 'resume' && (
                                  <Link to={`/courses/${course._id}/quiz`} className="ml-4 px-3 py-1 bg-blue-400 text-black rounded hover:bg-blue-500">Resume Quiz</Link>
                                )}
                                {quizStatus[course._id]?.type === 'view' && (
                                  <span className="ml-4 px-3 py-1 bg-green-400 text-black rounded">Score: {quizStatus[course._id].score} / {quizStatus[course._id].total}</span>
                                )}

                                <div className='w-1/4 px-2 py-3'>
                                    {course?.totalDuration}
                                </div>

                                <div className='flex w-1/5 flex-col gap-2 px- py-3'>
                                    {
                                        progressData?.map((progress,index)=> {
                                            //show 0 progress if no progress data is available
                                            if(progress?.courseID === course?._id) {
                                                return (
                                                    <div key={index}>
                                                        <p>Completed: {progress?.completedVideos?.length} / {totalNoOfLectures(course)}</p>
                                                        <ProgressBar
                                                            completed={progress?.completedVideos?.length/totalNoOfLectures(course)*100}
                                                            total={progress?.total}
                                                            height='8px'
                                                            isLabelVisible={false}
                                                            />
                                                    </div>
                                                )
                                            }
                                            return null;
                                        }
                                        )
                                    }
                                    </div> 
                            </div>
                        ))
                    }
                </div>
            )
        }
      
    </div>
  )
}

export default EnrolledCourses
