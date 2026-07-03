CREATE SCHEMA IF NOT EXISTS plant_care;

CREATE TABLE plants (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    watering_recommendations TEXT,
    lighting_recommendations TEXT,
    repotting_info TEXT,
    toxicity_info TEXT,
    additional_features TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_plants (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plant_id BIGINT REFERENCES plants(id) ON DELETE SET NULL,
    custom_name VARCHAR(255),
    notes TEXT,
    watering_interval_days INT,
    repotting_interval_days INT,
    next_watering_date DATE,
    next_repotting_date DATE,
    added_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE favorite_plants (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plant_id BIGINT NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, plant_id)
);

