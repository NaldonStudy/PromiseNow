package com.promisenow.api.domain.availability.service;

import com.promisenow.api.domain.availability.entity.Availability;
import com.promisenow.api.domain.availability.repository.AvailabilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class AvailabilityServiceImpl implements AvailabilityService {
    
    private final AvailabilityRepository availabilityRepository;
} 